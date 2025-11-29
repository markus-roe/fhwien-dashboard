import { NextRequest, NextResponse } from "next/server";
import { mockGroups, type Group } from "@/data/mockData";
import type {
  UpdateGroupRequest,
  GroupResponse,
  ApiError,
  ApiSuccess,
} from "@/lib/api-types";

let groups: Group[] = [...mockGroups];

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
