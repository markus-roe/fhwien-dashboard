import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { GroupResponse, ApiError } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData"; // Fallback current user

// Helper
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

export async function POST(
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
      include: { members: true, course: true },
    });

    if (!group) {
      return NextResponse.json<ApiError>(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    // Get real current user
    const dbUser = await prisma.user.findUnique({ where: { email: currentUser.email } }) || await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (group.members.some((m) => m.id === dbUser.id)) {
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
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: dbUser.id },
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
