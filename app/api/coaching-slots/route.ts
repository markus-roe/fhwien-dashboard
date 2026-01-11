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
// Helper
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
 *           type: string
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
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CoachingSlotsResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { code: courseId },
      });
      if (course) {
        where.courseId = course.id;
      } else {
        return NextResponse.json([]);
      }
    }

    const dbSlots = await prisma.coachingSlot.findMany({
      where,
      include: {
        course: true,
        participants: true,
      },
      orderBy: { startDateTime: "asc" },
    });

    const slots = dbSlots.map(mapDbSlotToApiSlot);

    return NextResponse.json<CoachingSlotsResponse>(slots);
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
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateCoachingSlotRequest;
    const {
      courseId,
      date,
      time,
      endTime,
      maxParticipants,
      participants = [], // Array of user IDs (strings)
      description,
    } = body;

    if (!courseId || !date || !time || !endTime || !maxParticipants) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { code: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Construct DateTimes
    const dateObj = new Date(date);
    const [startHour, startMinute] = time.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(dateObj);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(dateObj);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const matches = [];
    for (const pId of participants) {
      const idVal = parseInt(pId, 10);
      if (!isNaN(idVal)) {
        matches.push({ id: idVal });
      }
    }

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
    console.error("Error creating coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create coaching slot" },
      { status: 500 }
    );
  }
}

