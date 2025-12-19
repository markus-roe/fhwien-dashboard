import { NextRequest, NextResponse } from "next/server";
import {
  mockCoachingSlots,
  mockUsers,
  type CoachingSlot,
} from "@/shared/data/mockData";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  UpdateCoachingSlotRequest,
  CoachingSlotResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";

let coachingSlots: CoachingSlot[] = [...mockCoachingSlots];

/**
 * @swagger
 * /api/coaching-slots/{id}:
 *   get:
 *     summary: Get a coaching slot by ID
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     responses:
 *       200:
 *         description: Coaching slot details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       404:
 *         description: Coaching slot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  const slot = coachingSlots.find((s) => s.id === params.id);

  if (!slot) {
    return NextResponse.json<ApiError>(
      { error: "Coaching slot not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<CoachingSlotResponse>(slot);
}

/**
 * @swagger
 * /api/coaching-slots/{id}:
 *   put:
 *     summary: Update a coaching slot
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCoachingSlotRequest'
 *     responses:
 *       200:
 *         description: Coaching slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       400:
 *         description: Bad request - invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Coaching slot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateCoachingSlotRequest;
    const slotIndex = coachingSlots.findIndex((s) => s.id === params.id);

    if (slotIndex === -1) {
      return NextResponse.json<ApiError>(
        { error: "Coaching slot not found" },
        { status: 404 }
      );
    }

    const existingSlot = coachingSlots[slotIndex];
    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants,
      description,
    } = body;

    // Convert participant IDs to names if provided
    let participantNames = existingSlot.participants;
    if (participants !== undefined) {
      participantNames = participants
        .map((id: string) => {
          const user = mockUsers.find((u) => u.id === id);
          return user?.name;
        })
        .filter((name): name is string => !!name);
    }

    const updatedSlot: CoachingSlot = {
      ...existingSlot,
      ...(courseId && { courseId }),
      ...(date && { date: new Date(date) }),
      ...(time && { time }),
      ...(endTime && { endTime }),
      ...(maxParticipants !== undefined && { maxParticipants }),
      ...(participants !== undefined && { participants: participantNames }),
      ...(description !== undefined && { description }),
    };

    // Recalculate duration if time changed
    if (time || endTime) {
      updatedSlot.duration = calculateDuration(
        updatedSlot.time,
        updatedSlot.endTime
      );
    }

    coachingSlots[slotIndex] = updatedSlot;

    return NextResponse.json<CoachingSlotResponse>(updatedSlot);
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * @swagger
 * /api/coaching-slots/{id}:
 *   delete:
 *     summary: Delete a coaching slot
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     responses:
 *       200:
 *         description: Coaching slot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Coaching slot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  const slotIndex = coachingSlots.findIndex((s) => s.id === params.id);

  if (slotIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "Coaching slot not found" },
      { status: 404 }
    );
  }

  coachingSlots = coachingSlots.filter((s) => s.id !== params.id);

  return NextResponse.json<ApiSuccess>({ success: true });
}
