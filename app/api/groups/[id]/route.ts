import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  UpdateGroupRequest,
  GroupResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";
import type { Group } from "@/shared/data/mockData";

// hilfsfunktion (db group -> api group)
function mapDbGroupToApiGroup(dbGroup: any): any {
  return {
    id: dbGroup.id.toString(),
    courseId: dbGroup.course.code,
    name: dbGroup.name,
    description: dbGroup.description,
    maxMembers: dbGroup.maxMembers,
    members: dbGroup.members.map((m: any) => m.name),
    createdAt: dbGroup.createdAt,
  };
}

// get: einzelne gruppe laden
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    // gruppe suchen
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

    // wir ignorieren hier mitglieder updates, das geht über join/leave route
    const { courseId, name, description, maxMembers } = body;

    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (maxMembers !== undefined) data.maxMembers = maxMembers;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { code: courseId } });
      if (course) data.courseId = course.id;
    }

    // update durchführen
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

    // einfach löschen
    await prisma.group.delete({
      where: { id: groupId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete group", },
      { status: 500 }
    );
  }
}
