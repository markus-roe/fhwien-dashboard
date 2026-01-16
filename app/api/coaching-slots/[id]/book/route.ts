import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getCurrentUserFromRequest } from "@/shared/lib/auth";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CoachingSlot,
  User,
  ApiError,
} from "@/shared/lib/api-types";

// kleine helper funktion (db user -> api user)
function mapDbUserToApiUser(dbUser: {
  id: number;
  name: string;
  initials: string;
  email: string;
  program: string | null;
  role: string | null;
}): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    initials: dbUser.initials,
    email: dbUser.email,
    program: (dbUser.program as "DTI" | "DI") || "DTI",
    role: (dbUser.role as "student" | "professor") || "student",
  };
}

// helper um db slot in api format zu wandeln
function mapDbSlotToApiSlot(dbSlot: {
  id: number;
  startDateTime: Date;
  endDateTime: Date;
  maxParticipants: number;
  description: string | null;
  createdAt: Date;
  course: { id: number };
  participants: Array<{
    id: number;
    name: string;
    initials: string;
    email: string;
    program: string | null;
    role: string | null;
  }>;
}): CoachingSlot {
  const start = new Date(dbSlot.startDateTime);
  const end = new Date(dbSlot.endDateTime);

  // zeit schön machen (hh:mm)
  const time = start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: dbSlot.id,
    courseId: dbSlot.course.id,
    date: start,
    time: time,
    endTime: endTime,
    duration: calculateDuration(time, endTime),
    maxParticipants: dbSlot.maxParticipants,
    participants: dbSlot.participants.map(mapDbUserToApiUser),
    description: dbSlot.description ?? undefined,
    createdAt: dbSlot.createdAt,
  };
}

/**
 * @swagger
 * /api/coaching-slots/{id}/book:
 *   post:
 *     summary: Book a coaching slot
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Coaching slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID to book the slot for
 *     responses:
 *       200:
 *         description: Successfully booked the coaching slot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       400:
 *         description: Bad request - slot is full, already booked, or invalid user ID
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// post: slot buchen (jemanden einschreiben)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlot | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = currentUser.id;

    // slot suchen
    const slot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
      include: {
        course: true,
        participants: true,
      },
    });

    if (!slot) {
      return NextResponse.json<ApiError>(
        { error: "Coaching slot not found" },
        { status: 404 }
      );
    }

    // prüfen ob voll ist (0 heißt unbegrenzt)
    if (slot.maxParticipants > 0 && slot.participants.length >= slot.maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "Slot is full" },
        { status: 400 }
      );
    }

    // schauen ob user schon dabei ist
    if (slot.participants.some((p) => p.id === userId)) {
      return NextResponse.json<ApiError>(
        { error: "Already booked" },
        { status: 400 }
      );
    }

    // user hinzufuegen
    const updatedSlot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        course: true,
        participants: true,
      },
    });

    return NextResponse.json<CoachingSlot>(mapDbSlotToApiSlot(updatedSlot));
  } catch (error) {
    console.error("Error booking coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to book coaching slot" },
      { status: 500 }
    );
  }
}
