import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { CoachingSlotResponse, ApiError } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData"; // Wir nutzen vorerst noch den Mock-User als "aktuellen User"

// Helper Funktion, um das Datenbank-Format in das API-Format umzuwandeln
function mapDbSlotToApiSlot(dbSlot: any): any {
  // Zeit-Formatierung (z.B. "15:30")
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

  // Rückgabe des transformierten Objekts
  return {
    id: dbSlot.id.toString(),
    courseId: dbSlot.course.code,
    date: start,
    time: time,
    endTime: endTime,
    // duration wird hier vereinfacht weggelassen oder müsste berechnet werden
    maxParticipants: dbSlot.maxParticipants,
    participants: dbSlot.participants.map((p: any) => p.name),
    description: dbSlot.description,
    createdAt: dbSlot.createdAt,
  };
}

// POST-Methode: Wird aufgerufen, wenn jemand diesen Endpunkt anspricht
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } } // Die ID kommt aus der URL (.../coaching-slots/[id]/book)
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    // 1. ID aus der URL lesen und in eine Zahl umwandeln (Datenbank nutzt Zahlen als IDs)
    const slotId = parseInt(params.id, 10);

    // Prüfen, ob die ID gültig ist
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>(
        { error: "Ungültige Slot-ID" },
        { status: 400 } // 400 = Bad Request
      );
    }

    // 2. Den Coaching-Slot aus der Datenbank laden
    // Wir laden auch die Teilnehmer (members) mit, um zu prüfen, wie voll der Slot ist
    const slot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
      include: { participants: true, course: true },
    });

    // Prüfen, ob der Slot überhaupt existiert
    if (!slot) {
      return NextResponse.json<ApiError>(
        { error: "Coaching-Slot nicht gefunden" },
        { status: 404 } // 404 = Not Found
      );
    }

    // 3. Den aktuellen Benutzer laden (wer führt die Buchung durch?)
    // In einer echten App würde man die Session prüfen. Hier nehmen wir den User aus den Mock-Daten.
    const dbUser = await prisma.user.findUnique({
      where: { email: currentUser.email },
    }) || await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // 4. Logik-Prüfungen durchführen

    // Prüfung A: Ist der Benutzer schon angemeldet?
    // Wir schauen, ob die User-ID in der Liste der Teilnehmer enthalten ist
    if (slot.participants.some((p) => p.id === dbUser.id)) {
      return NextResponse.json<ApiError>(
        { error: "Du bist bereits für diesen Slot gebucht" },
        { status: 400 }
      );
    }

    // Prüfung B: Ist der Slot schon voll?
    if (slot.participants.length >= slot.maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "Dieser Slot ist leider schon voll" },
        { status: 400 }
      );
    }

    // 5. Buchung durchführen: Benutzer zur Teilnehmer-Liste hinzufügen
    // Wir nutzen "update", um die Beziehung (Relation) zwischen Slot und User herzustellen
    const updatedSlot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: {
        participants: {
          connect: { id: dbUser.id }, // "connect" verbindet den existierenden User mit diesem Slot
        },
      },
      include: {
        course: true,
        participants: true, // Wir brauchen die aktualisierte Liste für die Antwort
      },
    });

    // 6. Erfolgreiche Antwort zurücksenden
    // Die Daten werden vorher in das richtige Format für das Frontend umgewandelt
    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(updatedSlot));

  } catch (error) {
    // Fehlerbehandlung: Falls irgendwas schiefgeht (z.B. Datenbank nicht erreichbar)
    console.error("Fehler beim Buchen des Slots:", error);
    return NextResponse.json<ApiError>(
      { error: "Buchung fehlgeschlagen" },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}
