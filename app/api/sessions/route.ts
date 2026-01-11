import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateSessionRequest,
  GetSessionsQuery,
  SessionsResponse,
  SessionResponse,
  ApiError,
} from "@/shared/lib/api-types";
import type { Session } from "@/shared/data/mockData";

// Helper to map DB session to API session
function mapDbSessionToApiSession(dbSession: any): Session {
  // Format date as "YYYY-MM-DD" or ISO string as expected by client?
  // Mock data used Date objects that were often serialized.
  // We'll keep date as Date object, but times are strings "HH:mm"

  // We need to extract time from startDateTime if needed, but the model has separate fields?
  // Checking schema: startDateTime and endDateTime are DateTime.
  // But our API expects separate date, time, endTime strings and a Duration string.

  const start = new Date(dbSession.startDateTime);
  const end = new Date(dbSession.endDateTime);

  // Format time as HH:mm
  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: dbSession.id.toString(), // API expects string ID
    courseId: dbSession.course.code, // API expects course code (e.g. "ds")
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
    materials: [], // Materials not yet fully implemented in DB model or related table? Schema doesn't show materials relation yet.
    groupId: dbSession.groupId?.toString(),
    lecturer: dbSession.lecturer
      ? {
        name: dbSession.lecturer.name,
        initials: dbSession.lecturer.initials,
      }
      : undefined,
    isLive: dbSession.isLive || false
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<SessionsResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (courseId) {
      // Find course by code to get ID
      const course = await prisma.course.findUnique({
        where: { code: courseId },
      });

      if (course) {
        where.courseId = course.id;
      } else {
        return NextResponse.json([]); // Return empty if course code not found
      }
    }

    const dbSessions = await prisma.session.findMany({
      where,
      include: {
        course: true,
        lecturer: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const sessions = dbSessions.map(mapDbSessionToApiSession);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SessionResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateSessionRequest;
    const {
      courseId,
      type = "lecture",
      title,
      date,
      time,
      endTime,
      location,
      locationType,
      attendance = "mandatory",
      objectives = [],
      materials = [], // ignored for now
      groupId,
    } = body;

    if (!courseId || !title || !date || !time || !endTime || !location) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Resolve course code to ID
    const course = await prisma.course.findUnique({
      where: { code: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Construct DataTime objects
    const dateObj = new Date(date);
    const [startHour, startMinute] = time.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(dateObj);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(dateObj);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Create session
    const dbSession = await prisma.session.create({
      data: {
        courseId: course.id,
        type: type as any,
        title,
        startDateTime,
        endDateTime,
        location,
        locationType: locationType as any,
        attendance: attendance as any,
        objectives,
        groupId: groupId ? parseInt(groupId) : undefined,
        // lecturerId: ... we skip assuming current user or specific logic later
      },
      include: {
        course: true,
        lecturer: true,
      },
    });

    const newSession = mapDbSessionToApiSession(dbSession);

    return NextResponse.json<SessionResponse>(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
