import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  UpdateCoachingSlotRequest,
  CoachingSlotResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";
import { mockUsers } from "@/shared/data/mockData";

// hilfsfunktion (kopiert von der anderen datei)
function mapDbSlotToApiSlot(dbSlot: any): any {
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

  return {
    id: dbSlot.id.toString(),
    courseId: dbSlot.course.code,
    date: start,
    time: time,
    endTime: endTime,
    duration: calculateDuration(time, endTime),
    maxParticipants: dbSlot.maxParticipants,
    participants: dbSlot.participants.map((p: any) => p.name),
    description: dbSlot.description,
    createdAt: dbSlot.createdAt,
  };
}

// get request: einen einzelnen slot anzeigen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "id ist falsch" }, { status: 400 });
    }

    // slot suchen mit id
    const slot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
      include: {
        course: true,
        participants: true,
      },
    });

    if (!slot) {
      return NextResponse.json<ApiError>(
        { error: "slot wurde nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(slot));
  } catch (error) {
    console.error("fehler beim laden:", error);
    return NextResponse.json<ApiError>(
      { error: "laden fehlgeschlagen" },
      { status: 500 }
    );
  }
}

// put request: slot bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "id ist falsch" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateCoachingSlotRequest;

    // alten slot holen damit wir die zeiten wissen
    const existingSlot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
    });

    if (!existingSlot) {
      return NextResponse.json<ApiError>(
        { error: "slot nicht gefunden" },
        { status: 404 }
      );
    }

    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants,
      description,
    } = body;

    // nur die sachen updaten die auch geschickt wurden
    const data: any = {};
    if (maxParticipants !== undefined) data.maxParticipants = maxParticipants;
    if (description !== undefined) data.description = description;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { code: courseId } });
      if (course) data.courseId = course.id;
    }

    // zeit logik (kompliziert weil datum und zeit getrennt sind)
    let newStart = new Date(existingSlot.startDateTime);
    let newEnd = new Date(existingSlot.endDateTime);
    let dateChanged = false;

    if (date) {
      const d = new Date(date);
      newStart.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      newEnd.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      dateChanged = true;
    }

    if (time) {
      const [h, m] = time.split(":").map(Number);
      newStart.setHours(h, m, 0, 0);
      dateChanged = true;
    }

    if (endTime) {
      const [h, m] = endTime.split(":").map(Number);
      newEnd.setHours(h, m, 0, 0);
      dateChanged = true;
    }

    if (dateChanged) {
      data.startDateTime = newStart;
      data.endDateTime = newEnd;
    }

    // teilnehmer liste updaten (falls neue geschickt wurde)
    if (participants !== undefined) {
      const matches = [];
      for (const pId of participants) {
        const idVal = parseInt(pId, 10);
        if (!isNaN(idVal)) {
          matches.push({ id: idVal });
        }
      }
      data.participants = { set: matches };
    }

    // update durchführen
    const updatedSlot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data,
      include: {
        course: true,
        participants: true,
      },
    });

    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(updatedSlot));
  } catch (error) {
    console.error("fehler beim update:", error);
    return NextResponse.json<ApiError>(
      { error: "update hat nicht geklappt" },
      { status: 500 }
    );
  }
}

// delete request: slot löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "id ist falsch" }, { status: 400 });
    }

    // einfach löschen
    await prisma.coachingSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "slot nicht gefunden" },
        { status: 404 }
      );
    }
    console.error("fehler beim löschen:", error);
    return NextResponse.json<ApiError>(
      { error: "löschen hat nicht geklappt" },
      { status: 500 }
    );
  }
}
