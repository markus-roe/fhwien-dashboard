import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  UpdateSessionRequest,
  SessionResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";
import type { Session } from "@/shared/data/mockData";

// Reuse map function via copy or shared util if possible, but for now copying inline to avoid file jumps for user.
// (Better practice: extract to shared util, but user asked for these routes specifically)
function mapDbSessionToApiSession(dbSession: any): Session {
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

  return {
    id: dbSession.id.toString(),
    courseId: dbSession.course.code,
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
    groupId: dbSession.groupId?.toString(),
    lecturer: dbSession.lecturer
      ? {
        name: dbSession.lecturer.name,
        initials: dbSession.lecturer.initials,
      }
      : undefined,
    isLive: dbSession.isLive || false,
  };
}

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

    // We need current session to update times correctly if only one is provided
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
      materials,
      groupId,
    } = body;

    const data: any = {};
    if (title) data.title = title;
    if (type) data.type = type;
    if (location) data.location = location;
    if (locationType) data.locationType = locationType;
    if (attendance) data.attendance = attendance;
    if (objectives) data.objectives = objectives;
    if (groupId) data.groupId = parseInt(groupId);

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { code: courseId } });
      if (course) data.courseId = course.id;
    }

    // Handle date/time update
    // Logic: if date changes, update both start/end. If time changes, update start/end time components.
    // This is complex because we split them.

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
  } catch (error: any) {
    if (error.code === "P2025") {
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
