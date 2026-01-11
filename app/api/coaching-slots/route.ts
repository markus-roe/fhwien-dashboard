import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateCoachingSlotRequest,
  GetCoachingSlotsQuery,
  CoachingSlotsResponse,
  CoachingSlotResponse,
  ApiError,
} from "@/shared/lib/api-types";

// funktion um datenbank daten für frontend fertig zu machen
function mapDbSlotToApiSlot(dbSlot: any): any {
  const start = new Date(dbSlot.startDateTime);
  const end = new Date(dbSlot.endDateTime);

  // uhrzeit formatieren (damit es schön aussieht)
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
    duration: calculateDuration(time, endTime),
    maxParticipants: dbSlot.maxParticipants,
    // namen der teilnehmer raussuchen für die liste
    participants: dbSlot.participants.map((p: any) => p.name),
    description: dbSlot.description,
    createdAt: dbSlot.createdAt,
  };
}

// get request: alle slots holen
export async function GET(
  request: NextRequest
): Promise<NextResponse<CoachingSlotsResponse | ApiError>> {
  try {
    // schauen ob man nach kurs filtern will
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (courseId) {
      // kurs suchen mit dem code
      const course = await prisma.course.findUnique({
        where: { code: courseId },
      });
      if (course) {
        where.courseId = course.id;
      } else {
        // wenn kurs nicht gefunden, leere liste zurückgeben
        return NextResponse.json([]);
      }
    }

    // slots aus der db holen
    // teilnehmer und kurs infos mitladen (include)
    const dbSlots = await prisma.coachingSlot.findMany({
      where,
      include: {
        course: true,
        participants: true,
      },
      orderBy: { startDateTime: "asc" }, // sortieren nach zeit
    });

    // alle slots umwandeln
    const slots = dbSlots.map(mapDbSlotToApiSlot);

    return NextResponse.json<CoachingSlotsResponse>(slots);
  } catch (error) {
    console.error("fehler beim laden:", error);
    return NextResponse.json<ApiError>(
      { error: "laden fehlgeschlagen" },
      { status: 500 }
    );
  }
}

// post request: neuen slot erstellen
export async function POST(
  request: NextRequest
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    // daten vom frontend lesen
    const body = (await request.json()) as CreateCoachingSlotRequest;
    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants = [], // liste von user ids falls schon wer dabei ist
      description,
    } = body;

    // kurze überprüfung ob alles da ist
    if (!courseId || !date || !time || !endTime || !maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "bitte alles ausfüllen" },
        { status: 400 }
      );
    }

    // kurs suchen
    const course = await prisma.course.findUnique({
      where: { code: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "kurs nicht gefunden" },
        { status: 404 }
      );
    }

    // datum und zeit zusammenbauen
    const dateObj = new Date(date);
    const [startHour, startMinute] = time.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(dateObj);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(dateObj);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // teilnehmer vorbereiten (falls ids geschickt wurden)
    const matches = [];
    for (const pId of participants) {
      const idVal = parseInt(pId, 10);
      if (!isNaN(idVal)) {
        matches.push({ id: idVal });
      }
    }

    // slot in der db speichern
    const dbSlot = await prisma.coachingSlot.create({
      data: {
        courseId: course.id,
        startDateTime,
        endDateTime,
        maxParticipants,
        description,
        participants: matches.length > 0 ? {
          connect: matches
        } : undefined
      },
      include: {
        course: true,
        participants: true,
      },
    });

    const newSlot = mapDbSlotToApiSlot(dbSlot);

    return NextResponse.json<CoachingSlotResponse>(newSlot, { status: 201 });
  } catch (error) {
    console.error("fehler beim erstellen:", error);
    return NextResponse.json<ApiError>(
      { error: "erstellen hat nicht geklappt" },
      { status: 500 }
    );
  }
}

