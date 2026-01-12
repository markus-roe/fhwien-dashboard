import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateSessionRequest,
  SessionsResponse,
  SessionResponse,
  Session,
  UserRef,
  LocationType,
  SessionType,
  Attendance,
  ApiError,
} from "@/shared/lib/api-types";

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
  course: { id: number };
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
    materials: [], // Materials not yet implemented in DB
    groupId: dbSession.groupId || undefined,
    lecturer,
    isLive: dbSession.isLive || false,
  };
}

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter sessions by course ID
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SessionResponse'
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<SessionsResponse | ApiError>> {
  try {

    const dbSessions = await prisma.session.findMany({
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

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
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
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Construct DateTime objects
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
        type: type,
        title,
        startDateTime,
        endDateTime,
        location,
        locationType: locationType,
        attendance: attendance,
        objectives,
        groupId,
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
