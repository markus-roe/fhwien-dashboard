import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  CreateGroupRequest,
  GroupsResponse,
  GroupResponse,
  Group,
  User,
  ApiError,
} from "@/shared/lib/api-types";

// Helper to map DB user to API user
// helper: db user zu api user
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

// helper: db group zu api group
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
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter groups by course ID
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// get: alle gruppen holen
export async function GET(
  request: NextRequest
): Promise<NextResponse<GroupsResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = parseInt(searchParams.get("courseId") || "0");

    const where: { courseId?: number } = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const dbGroups = await prisma.group.findMany({
      where,
      include: {
        course: true,
        members: true,
      },
      orderBy: { name: "asc" },
    });

    const groups = dbGroups.map(mapDbGroupToApiGroup);

    return NextResponse.json<GroupsResponse>(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Bad request - missing required fields
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
// post: neue gruppe erstellen
export async function POST(
  request: NextRequest
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateGroupRequest;
    const { courseId, name, description, maxMembers } = body;

    if (!courseId || !name) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbGroup = await prisma.group.create({
      data: {
        courseId,
        name,
        description,
        maxMembers,
      },
      include: {
        course: true,
        members: true,
      },
    });

    const newGroup = mapDbGroupToApiGroup(dbGroup);

    return NextResponse.json<GroupResponse>(newGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
