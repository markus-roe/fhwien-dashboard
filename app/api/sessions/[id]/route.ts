import { NextRequest, NextResponse } from "next/server";
import { mockSessions, type Session } from "@/shared/data/mockData";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  UpdateSessionRequest,
  SessionResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";

let sessions: Session[] = [...mockSessions];

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
 *           type: string
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
 */
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
 *           type: string
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
 *           type: string
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
 */
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
