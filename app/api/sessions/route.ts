import { NextRequest, NextResponse } from "next/server";
import { mockSessions, type Session } from "@/shared/data/mockData";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateSessionRequest,
  GetSessionsQuery,
  SessionsResponse,
  SessionResponse,
  ApiError,
} from "@/shared/lib/api-types";

let sessions: Session[] = [...mockSessions];

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
