import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  UpdateSessionRequest,
  SessionResponse,
  Session,
  UserRef,
  LocationType,
  SessionType,
  Attendance,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";

// helper: db session -> api session
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

  // uhrzeit formatieren (hh:mm)
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

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// get: session holen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<SessionResponse | ApiError>> {
  try {
    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        lecturer: true,
      },
    });

    if (!session) {
      return NextResponse.json<ApiError>(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<SessionResponse>(mapDbSessionToApiSession(session));
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSessionRequest'
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionResponse'
 *       400:
 *         description: Bad request - invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// put: session updaten
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<SessionResponse | ApiError>> {
  try {
    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateSessionRequest;

    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return NextResponse.json<ApiError>(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const {
      courseId,
      type,
      title,
      date,
      time,
      endTime,
      location,
      locationType,
      attendance,
      objectives,
      groupId,
    } = body;

    interface UpdateData {
      title?: string;
      type?: SessionType;
      location?: string;
      locationType?: LocationType;
      attendance?: Attendance;
      objectives?: string[];
      groupId?: number;
      courseId?: number;
      startDateTime?: Date;
      endDateTime?: Date;
    }
    const data: UpdateData = {};
    if (title) data.title = title;
    if (type) data.type = type as SessionType;
    if (location) data.location = location;
    if (locationType) data.locationType = locationType as LocationType;
    if (attendance) data.attendance = attendance as Attendance;
    if (objectives) data.objectives = objectives;
    if (groupId) data.groupId = groupId;

    if (courseId) {
      data.courseId = courseId;
    }

    // zeit update (kompliziert)
    let newStart = new Date(existingSession.startDateTime);
    let newEnd = new Date(existingSession.endDateTime);
    let dateChanged = false;

    if (date) {
      const d = new Date(date);
      newStart.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      newEnd.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      dateChanged = true;
    }

    if (time) {
      const [h, m] = time.split(":").map(Number);
      newStart.setHours(h, m, 0, 0);
      dateChanged = true;
    }

    if (endTime) {
      const [h, m] = endTime.split(":").map(Number);
      newEnd.setHours(h, m, 0, 0);
      dateChanged = true;
    }

    if (dateChanged) {
      data.startDateTime = newStart;
      data.endDateTime = newEnd;
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data,
      include: { course: true, lecturer: true },
    });

    return NextResponse.json<SessionResponse>(mapDbSessionToApiSession(updatedSession));
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// delete: weg damit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const sessionId = parseInt(params.id, 10);
    if (isNaN(sessionId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting session:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
