import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { CoachingSlotResponse, ApiError } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData"; // nehmen wir für den eingeloggten user

// funktion damit die daten so aussehen wie das frontend sie braucht
function mapDbSlotToApiSlot(dbSlot: any): any {
  // zeit schön machen (hh:mm)
  const start = new Date(dbSlot.startDateTime);
  const end = new Date(dbSlot.endDateTime);

  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // hier bauen wir das objekt zusammen was zurück kommt
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

// hier kommt der post request an (wenn man auf buchen klickt)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // id aus der url
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    // id muss eine zahl sein für prisma
    const slotId = parseInt(params.id, 10);

    // checken ob id eine echte zahl ist
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>(
        { error: "id is wrong" },
        { status: 400 }
      );
    }

    // slot aus der datenbank holen
    // holen auch die teilnehmer dazu damit wir wissen ob voll ist
    const slot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
      include: { participants: true, course: true },
    });

    // wenn slot nicht gefunden wurde
    if (!slot) {
      return NextResponse.json<ApiError>(
        { error: "coaching not found" },
        { status: 404 }
      );
    }

    // current user finden (in echt wäre das über session)
    const dbUser = await prisma.user.findUnique({
      where: { email: currentUser.email },
    }) || await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "user not found" },
        { status: 404 }
      );
    }

    // schauen ob user schon dabei ist
    // wir gehen durch alle teilnehmer und vergleichen die ids
    if (slot.participants.some((p) => p.id === dbUser.id)) {
      return NextResponse.json<ApiError>(
        { error: "user is already registered" },
        { status: 400 }
      );
    }

    // schauen ob noch platz ist
    if (slot.participants.length >= slot.maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "coaching is full" },
        { status: 400 }
      );
    }

    // jetzt update machen und user hinzufügen
    const updatedSlot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: {
        participants: {
          connect: { id: dbUser.id }, // connect verbindet user mit slot
        },
      },
      include: {
        course: true,
        participants: true, // brauchen wir für das update im frontend
      },
    });

    // erfolg zurückmelden und daten umwandeln
    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(updatedSlot));

  } catch (error) {
    // falls was kaputt geht
    console.error("fehler:", error);
    return NextResponse.json<ApiError>(
      { error: "booking failed" },
      { status: 500 }
    );
  }
}
