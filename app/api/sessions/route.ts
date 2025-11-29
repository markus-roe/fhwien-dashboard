import { NextRequest, NextResponse } from "next/server";
import { mockSessions, type Session } from "@/data/mockData";
import { calculateDuration } from "@/lib/dashboardUtils";
import type {
  CreateSessionRequest,
  GetSessionsQuery,
  SessionsResponse,
  SessionResponse,
  ApiError,
} from "@/lib/api-types";

let sessions: Session[] = [...mockSessions];

export async function GET(
  request: NextRequest
): Promise<NextResponse<SessionsResponse | ApiError>> {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  const query: GetSessionsQuery = {};
  if (courseId) {
    query.courseId = courseId;
  }

  let filteredSessions = sessions;

  if (query.courseId) {
    filteredSessions = sessions.filter((s) => s.courseId === query.courseId);
  }

  return NextResponse.json(filteredSessions);
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
      materials = [],
      groupId,
    } = body;

    if (!courseId || !title || !date || !time || !endTime || !location) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newSession: Session = {
      id: `s-${Date.now()}`,
      courseId,
      type: type as Session["type"],
      title,
      date: new Date(date),
      time,
      endTime,
      duration: calculateDuration(time, endTime),
      location,
      locationType: locationType as Session["locationType"],
      attendance: attendance as Session["attendance"],
      objectives: objectives || [],
      materials: materials || [],
      groupId,
    };

    sessions.push(newSession);

    return NextResponse.json<SessionResponse>(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
