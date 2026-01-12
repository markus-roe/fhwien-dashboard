import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  UpdateGroupRequest,
  GroupResponse,
  Group,
  User,
  ApiError,
  ApiSuccess,
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

// helper: db group -> api group
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
 * /api/groups/{id}:
 *   get:
 *     summary: Get a group by ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// get: gruppe anzeigen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        course: true,
        members: true,
      },
    });

    if (!group) {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<GroupResponse>(mapDbGroupToApiGroup(group));
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroupRequest'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Bad request - invalid request body
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
 */
// put: gruppe bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    const body = (await request.json()) as UpdateGroupRequest;
    const { courseId, name, description, maxMembers, members } = body;

    interface UpdateData {
      name?: string;
      description?: string;
      maxMembers?: number;
      courseId?: number;
      members?: { set: Array<{ id: number }> };
    }
    const data: UpdateData = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (maxMembers !== undefined) data.maxMembers = maxMembers;

    if (courseId) {
      data.courseId = courseId;
    }

    // mitglieder updaten wenn gewollt
    if (members !== undefined) {
      const matches = members
        .filter((id) => typeof id === "number" && !isNaN(id))
        .map((id) => ({ id }));
      data.members = { set: matches };
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data,
      include: {
        course: true,
        members: true,
      },
    });

    return NextResponse.json<GroupResponse>(mapDbGroupToApiGroup(updatedGroup));
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// delete: gruppe löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.group.delete({
      where: { id: groupId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
