import { NextRequest, NextResponse } from "next/server";
import {
  mockCoachingSlots,
  currentUser,
  type CoachingSlot,
} from "@/data/mockData";
import type {
  CoachingSlotResponse,
  ApiError,
} from "@/lib/api-types";

let coachingSlots: CoachingSlot[] = [...mockCoachingSlots];

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

