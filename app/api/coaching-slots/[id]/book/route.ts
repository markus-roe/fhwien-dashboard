import { NextRequest, NextResponse } from "next/server";
import {
  mockCoachingSlots,
  currentUser,
  type CoachingSlot,
} from "@/shared/data/mockData";
import type { CoachingSlotResponse, ApiError } from "@/shared/lib/api-types";

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

  // Check if slot is full
  if (slot.participants.length >= slot.maxParticipants) {
    return NextResponse.json<ApiError>(
      { error: "Slot is full" },
      { status: 400 }
    );
  }

  // Check if user is already booked
  if (slot.participants.includes(currentUser.name)) {
    return NextResponse.json<ApiError>(
      { error: "Already booked" },
      { status: 400 }
    );
  }

  // Add user to participants
  coachingSlots[slotIndex] = {
    ...slot,
    participants: [...slot.participants, currentUser.name],
  };

  return NextResponse.json<CoachingSlotResponse>(coachingSlots[slotIndex]);
}
