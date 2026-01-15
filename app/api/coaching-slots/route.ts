import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { calculateDuration } from "@/shared/lib/dashboardUtils";
import type {
  CreateCoachingSlotRequest,
  CoachingSlot,
  User,
  ApiError,
} from "@/shared/lib/api-types";

// kleine funktion um db user in api user umzuwandeln
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

// funktion um db slot in das api format zu bringen
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

  // uhrzeit formatieren (hh:mm)
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
 * /api/coaching-slots:
 *   get:
 *     summary: Get all coaching slots
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter coaching slots by course ID
 *     responses:
 *       200:
 *         description: List of coaching slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoachingSlotResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// get: alle coaching slots laden
export async function GET(
): Promise<NextResponse<CoachingSlot[] | ApiError>> {
  try {
    const dbSlots = await prisma.coachingSlot.findMany({
      include: {
        course: true,
        participants: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const slots = dbSlots.map(mapDbSlotToApiSlot);

    return NextResponse.json<CoachingSlot[]>(slots);
  } catch (error) {
    console.error("Error fetching coaching slots:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch coaching slots" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/coaching-slots:
 *   post:
 *     summary: Create a new coaching slot
 *     tags: [Coaching Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCoachingSlotRequest'
 *     responses:
 *       201:
 *         description: Coaching slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Course not found
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
// post: neuen slot erstellen
export async function POST(
  request: NextRequest
): Promise<NextResponse<CoachingSlot | ApiError>> {
  try {
    const body = (await request.json()) as CreateCoachingSlotRequest;
    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants = [],
      description,
    } = body;

    // validation: schauen ob alles da ist
    if (!courseId || !date || !time || !endTime || maxParticipants === undefined) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // kurs suchen
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // datum und zeit zusammenbauen für db
    const dateObj = new Date(date);
    const [startHour, startMinute] = time.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(dateObj);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(dateObj);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // teilnehmer verknüpfen (wir erwarten user ids)
    const connectParticipants = participants
      .filter((id) => typeof id === "number" && !isNaN(id))
      .map((id) => ({ id }));

    // slot in db speichern
    const dbSlot = await prisma.coachingSlot.create({
      data: {
        courseId: course.id,
        startDateTime,
        endDateTime,
        maxParticipants,
        description,
        participants:
          connectParticipants.length > 0
            ? { connect: connectParticipants }
            : undefined,
      },
      include: {
        course: true,
        participants: true,
      },
    });

    const newSlot = mapDbSlotToApiSlot(dbSlot);

    return NextResponse.json<CoachingSlot>(newSlot, { status: 201 });
  } catch (error) {
    console.error("Error creating coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create coaching slot" },
      { status: 500 }
    );
  }
}
