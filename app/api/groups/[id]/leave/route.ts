import { NextRequest, NextResponse } from "next/server";
import { mockGroups, currentUser, type Group } from "@/shared/data/mockData";
import type {
  GroupResponse,
  ApiError,
} from "@/shared/lib/api-types";

let groups: Group[] = [...mockGroups];

/**
 * @swagger
 * /api/groups/{id}/leave:
 *   post:
 *     summary: Leave a group
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
 *         description: Successfully left the group
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
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  const groupIndex = groups.findIndex((g) => g.id === params.id);

  if (groupIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "Group not found" },
      { status: 404 }
    );
  }

  const group = groups[groupIndex];

  // Remove user from members
  groups[groupIndex] = {
    ...group,
    members: group.members.filter((m) => m !== currentUser.name),
  };

  return NextResponse.json<GroupResponse>(groups[groupIndex]);
}
