import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getCurrentUserFromRequest } from "@/shared/lib/auth";
import type {
  GroupResponse,
  Group,
  User,
  ApiError,
} from "@/shared/lib/api-types";

// helper: db user -> api user
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

// helper: db group -> api group format
function mapDbGroupToApiGroup(dbGroup: {
  id: number;
  name: string;
  description: string | null;
  maxMembers: number | null;
  createdAt: Date;
  course: { id: number };
  members: Array<{
    id: number;
    name: string;
    initials: string;
    email: string;
    program: string | null;
    role: string | null;
  }>;
}): Group {
  return {
    id: dbGroup.id,
    courseId: dbGroup.course.id,
    name: dbGroup.name,
    description: dbGroup.description ?? undefined,
    maxMembers: dbGroup.maxMembers ?? undefined,
    members: dbGroup.members.map(mapDbUserToApiUser),
    createdAt: dbGroup.createdAt,
  };
}

/**
 * @swagger
 * /api/groups/{id}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group ID
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
 *                 description: User ID to join the group
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Bad request - already a member, group is full, or invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Group not found
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
// post: gruppe beitreten
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
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

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true, course: true },
    });

    if (!group) {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // schauen ob user schon dabei ist
    if (group.members.some((m) => m.id === userId)) {
      return NextResponse.json<ApiError>(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    // prüfen ob gruppe voll ist
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return NextResponse.json<ApiError>(
        { error: "Group is full" },
        { status: 400 }
      );
    }

    // user hinzufügen
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        course: true,
        members: true,
      },
    });

    return NextResponse.json<GroupResponse>(mapDbGroupToApiGroup(updatedGroup));
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}
