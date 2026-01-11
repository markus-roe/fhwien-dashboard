import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  CreateGroupRequest,
  GetGroupsQuery,
  GroupsResponse,
  GroupResponse,
  ApiError,
} from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData"; // Keep for fallback if needed, but we should try to use real user

// Helper
function mapDbGroupToApiGroup(dbGroup: any): any {
  return {
    id: dbGroup.id.toString(),
    courseId: dbGroup.course.code,
    name: dbGroup.name,
    description: dbGroup.description,
    maxMembers: dbGroup.maxMembers,
    members: dbGroup.members.map((m: any) => m.name), // Map User objects to names array as expected by frontend
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
 *           type: string
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
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<GroupsResponse | ApiError>> {
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
 */
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

    const course = await prisma.course.findUnique({
      where: { code: courseId },
    });

    if (!course) {
      return NextResponse.json<ApiError>(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Determine current user to add to group
    // In real app, get from session. For now, find user by email or pick first.
    const user = await prisma.user.findUnique({ where: { email: currentUser.email } }) || await prisma.user.findFirst();

    const dbGroup = await prisma.group.create({
      data: {
        courseId: course.id,
        name,
        description,
        maxMembers,
        members: user ? {
          connect: { id: user.id }
        } : undefined,
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
