import { NextRequest, NextResponse } from "next/server";
import {
  mockCoachingSlots,
  mockUsers,
  type CoachingSlot,
} from "@/shared/data/mockData";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateCoachingSlotRequest,
  GetCoachingSlotsQuery,
  CoachingSlotsResponse,
  CoachingSlotResponse,
  ApiError,
} from "@/shared/lib/api-types";

let coachingSlots: CoachingSlot[] = [...mockCoachingSlots];

/**
 * @swagger
 * /api/coaching-slots:
 *   get:
 *     summary: Get all coaching slots
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter coaching slots by course ID
 *     responses:
 *       200:
 *         description: List of coaching slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoachingSlotResponse'
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CoachingSlotsResponse | ApiError>> {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  const query: GetCoachingSlotsQuery = {};
  if (courseId) {
    query.courseId = courseId;
  }

  let filteredSlots = coachingSlots;

  if (query.courseId) {
    filteredSlots = coachingSlots.filter((s) => s.courseId === query.courseId);
  }

  return NextResponse.json(filteredSlots);
}

/**
 * @swagger
 * /api/coaching-slots:
 *   post:
 *     summary: Create a new coaching slot
 *     tags: [Coaching Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCoachingSlotRequest'
 *     responses:
 *       201:
 *         description: Coaching slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateCoachingSlotRequest;
    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants = [],
      description,
    } = body;

    if (!courseId || !date || !time || !endTime || !maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert participant IDs to names
    const participantNames = participants
      .map((id: string) => {
        const user = mockUsers.find((u) => u.id === id);
        return user?.name;
      })
      .filter((name): name is string => !!name);

    const newSlot: CoachingSlot = {
      id: `cs-${Date.now()}`,
      courseId,
      date: new Date(date),
      time,
      endTime,
      duration: calculateDuration(time, endTime),
      maxParticipants,
      participants: participantNames,
      description,
      createdAt: new Date(),
    };

    coachingSlots.push(newSlot);

    return NextResponse.json<CoachingSlotResponse>(newSlot, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

