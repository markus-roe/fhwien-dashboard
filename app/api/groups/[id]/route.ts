import { NextRequest, NextResponse } from "next/server";
import { mockGroups, type Group } from "@/shared/data/mockData";
import type {
  UpdateGroupRequest,
  GroupResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";

let groups: Group[] = [...mockGroups];

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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  const group = groups.find((g) => g.id === params.id);

  if (!group) {
    return NextResponse.json<ApiError>(
      { error: "Group not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<GroupResponse>(group);
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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateGroupRequest;
    const groupIndex = groups.findIndex((g) => g.id === params.id);

    if (groupIndex === -1) {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const existingGroup = groups[groupIndex];
    const { courseId, name, description, maxMembers, members } = body;

    const updatedGroup: Group = {
      ...existingGroup,
      ...(courseId && { courseId }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(maxMembers !== undefined && { maxMembers }),
      ...(members !== undefined && { members }),
    };

    groups[groupIndex] = updatedGroup;

    return NextResponse.json<GroupResponse>(updatedGroup);
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  const groupIndex = groups.findIndex((g) => g.id === params.id);

  if (groupIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "Group not found" },
      { status: 404 }
    );
  }

  groups = groups.filter((g) => g.id !== params.id);

  return NextResponse.json<ApiSuccess>({ success: true });
}
