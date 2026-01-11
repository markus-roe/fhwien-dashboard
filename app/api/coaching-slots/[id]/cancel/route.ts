import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { CoachingSlotResponse, ApiError } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData";

// daten umwandeln für frontend
function mapDbSlotToApiSlot(dbSlot: any): any {
  const start = new Date(dbSlot.startDateTime);
  const end = new Date(dbSlot.endDateTime);

  // zeit einfach formatieren
  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: dbSlot.id.toString(),
    courseId: dbSlot.course.code,
    date: start,
    time: time,
    endTime: endTime,
    maxParticipants: dbSlot.maxParticipants,
    participants: dbSlot.participants.map((p: any) => p.name),
    description: dbSlot.description,
    createdAt: dbSlot.createdAt,
  };
}

// post um die buchung abzusagen (cancel)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    // id umwandeln
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    // slot suchen
    const slot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
      include: { participants: true },
    });

    if (!slot) {
      return NextResponse.json<ApiError>(
        { error: "Coaching slot not found" },
        { status: 404 }
      );
    }

    // user holen der eingeloggt ist
    const dbUser = await prisma.user.findUnique({ where: { email: currentUser.email } }) || await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // user aus der liste löschen (disconnect)
    const updatedSlot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: {
        participants: {
          disconnect: { id: dbUser.id }, // verbindung trennen
        },
      },
      include: {
        course: true,
        participants: true,
      },
    });

    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(updatedSlot));
  } catch (error) {
    console.error("Error canceling booking:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}

