import { NextRequest, NextResponse } from "next/server";
import { mockSessions, type Session } from "@/data/mockData";
import { calculateDuration } from "@/lib/dashboardUtils";
import type {
  UpdateSessionRequest,
  SessionResponse,
  ApiError,
  ApiSuccess,
} from "@/lib/api-types";

let sessions: Session[] = [...mockSessions];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<SessionResponse | ApiError>> {
  const session = sessions.find((s) => s.id === params.id);

  if (!session) {
    return NextResponse.json<ApiError>(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<SessionResponse>(session);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<SessionResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateSessionRequest;
    const sessionIndex = sessions.findIndex((s) => s.id === params.id);

    if (sessionIndex === -1) {
      return NextResponse.json<ApiError>(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const existingSession = sessions[sessionIndex];
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

    const updatedSession: Session = {
      ...existingSession,
      ...(courseId && { courseId }),
      ...(type && { type: type as Session["type"] }),
      ...(title && { title }),
      ...(date && { date: new Date(date) }),
      ...(time && { time }),
      ...(endTime && { endTime }),
      ...(location && { location }),
      ...(locationType && {
        locationType: locationType as Session["locationType"],
      }),
      ...(attendance && { attendance: attendance as Session["attendance"] }),
      ...(objectives !== undefined && { objectives }),
      ...(materials !== undefined && { materials }),
      ...(groupId !== undefined && { groupId }),
    };

    // Recalculate duration if time changed
    if (time || endTime) {
      updatedSession.duration = calculateDuration(
        updatedSession.time,
        updatedSession.endTime
      );
    }

    sessions[sessionIndex] = updatedSession;

    return NextResponse.json<SessionResponse>(updatedSession);
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  const sessionIndex = sessions.findIndex((s) => s.id === params.id);

  if (sessionIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  sessions = sessions.filter((s) => s.id !== params.id);

  return NextResponse.json<ApiSuccess>({ success: true });
}
