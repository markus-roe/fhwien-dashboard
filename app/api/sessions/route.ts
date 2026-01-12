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

// hilfsfunktion (datenbank session -> api session)
function mapDbSessionToApiSession(dbSession: any): Session {
  const start = new Date(dbSession.startDateTime);
  const end = new Date(dbSession.endDateTime);

  // uhrzeit formatieren (hh:mm)
  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: dbSession.id.toString(), // id muss string sein für api
    courseId: dbSession.course.code, // kurs code (z.b. "ds")
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
    materials: [], // materialien haben wir noch nicht in der db
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

// get: alle sessions holen
export async function GET(
  request: NextRequest
): Promise<NextResponse<SessionsResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (courseId) {
      // kurs suchen um id zu bekommen
      const course = await prisma.course.findUnique({
        where: { code: courseId },
      });

      if (course) {
        where.courseId = course.id;
      } else {
        return NextResponse.json([]); // wenn kurs nicht gefunden, leere liste
      }
    }

    // sessions aus der db laden
    const dbSessions = await prisma.session.findMany({
      where,
      include: {
        course: true,
        lecturer: true,
      },
      orderBy: { startDateTime: "asc" }, // sortieren
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

// post: neue session erstellen
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
      materials = [], // wird noch ignoriert
      groupId,
    } = body;

    // validation (schauen ob alles da ist)
    if (!courseId || !title || !date || !time || !endTime || !location) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // kurs finden
    const course = await prisma.course.findUnique({
      where: { code: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // datum und zeit zusammenbauen
    const dateObj = new Date(date);
    const [startHour, startMinute] = time.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(dateObj);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(dateObj);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // session speichern
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
