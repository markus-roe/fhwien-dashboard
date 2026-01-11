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
 * /api/coaching-slots/{id}:
 *   get:
 *     summary: Get a coaching slot by ID
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     responses:
 *       200:
 *         description: Coaching slot details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       404:
 *         description: Coaching slot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

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

    return NextResponse.json<CoachingSlotResponse>(mapDbSlotToApiSlot(slot));
  } catch (error) {
    console.error("Error fetching coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch coaching slot" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/coaching-slots/{id}:
 *   put:
 *     summary: Update a coaching slot
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCoachingSlotRequest'
 *     responses:
 *       200:
 *         description: Coaching slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoachingSlotResponse'
 *       400:
 *         description: Bad request - invalid request body
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
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CoachingSlotResponse | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateCoachingSlotRequest;

    const existingSlot = await prisma.coachingSlot.findUnique({
      where: { id: slotId },
    });

    if (!existingSlot) {
      return NextResponse.json<ApiError>(
        { error: "Coaching slot not found" },
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

    const data: any = {};
    if (maxParticipants !== undefined) data.maxParticipants = maxParticipants;
    if (description !== undefined) data.description = description;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { code: courseId } });
      if (course) data.courseId = course.id;
    }

    // Handle date/time
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

    // Handle participants update if provided
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
    console.error("Error updating coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update coaching slot" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/coaching-slots/{id}:
 *   delete:
 *     summary: Delete a coaching slot
 *     tags: [Coaching Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coaching slot ID
 *     responses:
 *       200:
 *         description: Coaching slot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Coaching slot not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const slotId = parseInt(params.id, 10);
    if (isNaN(slotId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.coachingSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "Coaching slot not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting coaching slot:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete coaching slot" },
      { status: 500 }
    );
  }
}
