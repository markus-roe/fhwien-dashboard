import { NextRequest, NextResponse } from "next/server";
import {
  mockCoachingSlots,
  currentUser,
  type CoachingSlot,
} from "@/shared/data/mockData";
import type {
  CoachingSlotResponse,
  ApiError,
} from "@/shared/lib/api-types";

let coachingSlots: CoachingSlot[] = [...mockCoachingSlots];

/**
 * @swagger
 * /api/coaching-slots/{id}/cancel:
 *   post:
 *     summary: Cancel a coaching slot booking
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
 *         description: Successfully cancelled the booking
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
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  const slotIndex = coachingSlots.findIndex((s) => s.id === params.id);

  if (slotIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "Coaching slot not found" },
      { status: 404 }
    );
  }

  const slot = coachingSlots[slotIndex];

  // Remove user from participants
  coachingSlots[slotIndex] = {
    ...slot,
    participants: slot.participants.filter((p) => p !== currentUser.name),
  };

  return NextResponse.json<CoachingSlotResponse>(coachingSlots[slotIndex]);
}

