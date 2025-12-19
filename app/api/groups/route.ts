import { NextRequest, NextResponse } from "next/server";
import { mockGroups, currentUser, type Group } from "@/shared/data/mockData";
import type {
  CreateGroupRequest,
  GetGroupsQuery,
  GroupsResponse,
  GroupResponse,
  ApiError,
} from "@/shared/lib/api-types";

let groups: Group[] = [...mockGroups];

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
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  const query: GetGroupsQuery = {};
  if (courseId) {
    query.courseId = courseId;
  }

  let filteredGroups = groups;

  if (query.courseId) {
    filteredGroups = groups.filter((g) => g.courseId === query.courseId);
  }

  return NextResponse.json<GroupsResponse>(filteredGroups);
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

    const newGroup: Group = {
      id: `g-${Date.now()}`,
      courseId,
      name,
      description,
      maxMembers,
      members: [currentUser.name],
      createdAt: new Date(),
    };

    groups.push(newGroup);

    return NextResponse.json<GroupResponse>(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
