import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getUserFromCalendarToken, getCurrentUser } from "@/shared/lib/auth";
import { generateIcalFile } from "@/shared/lib/ical";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type { Session, CoachingSlot, Course, UserRef, LocationType, SessionType, Attendance } from "@/shared/lib/api-types";

// Helper to map DB session to API session
function mapDbSessionToApiSession(dbSession: {
  id: number;
  type: SessionType;
  title: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  locationType: LocationType;
  attendance: Attendance;
  objectives: string[];
  isLive: boolean | null;
  groupId: number | null;
  course: { id: number; title: string; programs: string[] };
  lecturer: {
    name: string;
    initials: string;
  } | null;
}): Session {
  const start = new Date(dbSession.startDateTime);
  const end = new Date(dbSession.endDateTime);

  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lecturer: UserRef | undefined = dbSession.lecturer
    ? {
        name: dbSession.lecturer.name,
        initials: dbSession.lecturer.initials,
      }
    : undefined;

  return {
    id: dbSession.id,
    courseId: dbSession.course.id,
    type: dbSession.type,
    title: dbSession.title,
    date: start,
    time: time,
    endTime: endTime,
    duration: calculateDuration(time, endTime),
    location: dbSession.location,
    locationType: dbSession.locationType,
    attendance: dbSession.attendance,
    objectives: dbSession.objectives,
    materials: [],
    groupId: dbSession.groupId || undefined,
    lecturer,
    isLive: dbSession.isLive || false,
  };
}

// Helper to map DB coaching slot to API coaching slot
function mapDbSlotToApiSlot(dbSlot: {
  id: number;
  startDateTime: Date;
  endDateTime: Date;
  maxParticipants: number;
  description: string | null;
  createdAt: Date;
  course: { id: number; title: string; programs: string[] };
  participants: Array<{
    id: number;
    name: string;
    initials: string;
    email: string;
    program: string | null;
    role: string | null;
  }>;
}): CoachingSlot {
  const start = new Date(dbSlot.startDateTime);
  const end = new Date(dbSlot.endDateTime);

  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: dbSlot.id,
    courseId: dbSlot.course.id,
    date: start,
    time: time,
    endTime: endTime,
    duration: calculateDuration(time, endTime),
    maxParticipants: dbSlot.maxParticipants,
    participants: dbSlot.participants.map((p) => ({
      id: p.id,
      name: p.name,
      initials: p.initials,
      email: p.email,
      program: (p.program as "DTI" | "DI") || "DTI",
      role: (p.role as "student" | "professor" | "admin") || "student",
    })),
    description: dbSlot.description ?? undefined,
    createdAt: dbSlot.createdAt,
  };
}

/**
 * GET /api/calendar/feed.ics
 * 
 * Returns an iCal feed with all sessions and coaching slots for the authenticated user.
 * This endpoint can be subscribed to in Google Calendar, Outlook, Apple Calendar, etc.
 * 
 * The feed includes:
 * - All sessions from courses in the user's program
 * - All coaching slots where the user is a participant
 * 
 * Authentication: Token-based (via query parameter ?token=USER_TOKEN)
 * This allows external calendar services to access the feed without cookies.
 */
export async function GET(request: NextRequest) {
  try {
    // Try token-based authentication first (for external calendar services)
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    
    let user = null;
    
    if (token) {
      // Token-based auth (for Google Calendar, etc.)
      user = await getUserFromCalendarToken(token);
    } else {
      // Fallback to session-based auth (for direct browser access)
      user = await getCurrentUser();
    }
    
    if (!user) {
      return new NextResponse("Unauthorized - Please provide a valid token or be logged in", { 
        status: 401,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    // Fetch all courses
    const courses = await prisma.course.findMany({
      where: {
        programs: {
          has: user.program,
        },
      },
    });

    const courseIds = courses.map((c) => c.id);

    // Fetch all sessions from courses in user's program
    const dbSessions = await prisma.session.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
      include: {
        course: true,
        lecturer: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const sessions = dbSessions.map(mapDbSessionToApiSession);

    // Fetch all coaching slots where user is a participant
    const dbCoachingSlots = await prisma.coachingSlot.findMany({
      where: {
        participants: {
          some: {
            id: user.id,
          },
        },
      },
      include: {
        course: true,
        participants: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const coachingSlots = dbCoachingSlots.map(mapDbSlotToApiSlot);

    // Create a map of session IDs to their original Date objects for timezone-correct conversion
    const sessionDateMap = new Map<number, { start: Date; end: Date }>();
    dbSessions.forEach((s) => {
      sessionDateMap.set(s.id, {
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime),
      });
    });

    const coachingSlotDateMap = new Map<number, { start: Date; end: Date }>();
    dbCoachingSlots.forEach((s) => {
      coachingSlotDateMap.set(s.id, {
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime),
      });
    });

    // Map courses to API format
    const apiCourses: Course[] = courses.map((c) => ({
      id: c.id,
      title: c.title,
      program: c.programs as ("DTI" | "DI")[],
    }));

    // Find the most recent update time for cache headers
    const allUpdatedAts = [
      ...dbSessions.map((s) => s.updatedAt.getTime()),
      ...dbCoachingSlots.map((s) => s.updatedAt.getTime()),
    ];
    const lastModified = allUpdatedAts.length > 0 
      ? new Date(Math.max(...allUpdatedAts))
      : new Date();

    // Generate iCal file with original Date objects for correct timezone handling
    const icalContent = generateIcalFile(
      sessions,
      coachingSlots,
      apiCourses,
      dbSessions,
      dbCoachingSlots,
      sessionDateMap,
      coachingSlotDateMap
    );

    // Format last modified date for HTTP header
    const lastModifiedStr = lastModified.toUTCString();

    // Return iCal file with proper headers
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="fhwien-calendar.ics"',
        "Cache-Control": "public, max-age=300, must-revalidate", // Cache for 5 minutes, but allow revalidation
        "Last-Modified": lastModifiedStr,
        "ETag": `"${lastModified.getTime()}"`, // ETag for better cache validation
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error generating calendar feed:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
