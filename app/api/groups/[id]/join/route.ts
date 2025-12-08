import { NextRequest, NextResponse } from "next/server";
import { mockGroups, currentUser, type Group } from "@/shared/data/mockData";
import type {
  GroupResponse,
  ApiError,
} from "@/shared/lib/api-types";

let groups: Group[] = [...mockGroups];

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

  // Check if user is already a member
  if (group.members.includes(currentUser.name)) {
    return NextResponse.json<ApiError>(
      { error: "Already a member" },
      { status: 400 }
    );
  }

  // Check if group is full
  if (group.maxMembers && group.members.length >= group.maxMembers) {
    return NextResponse.json<ApiError>(
      { error: "Group is full" },
      { status: 400 }
    );
  }

  // Add user to members
  groups[groupIndex] = {
    ...group,
    members: [...group.members, currentUser.name],
  };

  return NextResponse.json<GroupResponse>(groups[groupIndex]);
}
