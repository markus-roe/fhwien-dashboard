import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { GroupResponse, ApiError } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData";

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

// post: gruppe beitreten
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const groupId = parseInt(params.id, 10);
    if (isNaN(groupId)) {
      return NextResponse.json<ApiError>({ error: "Invalid ID" }, { status: 400 });
    }

    // gruppe laden
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

    // current user finden
    const dbUser = await prisma.user.findUnique({ where: { email: currentUser.email } }) || await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // checken ob user schon drin ist
    if (group.members.some((m) => m.id === dbUser.id)) {
      return NextResponse.json<ApiError>(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    // checken ob gruppe schon voll ist
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return NextResponse.json<ApiError>(
        { error: "Group is full" },
        { status: 400 }
      );
    }

    // user hinzufügen
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: dbUser.id }, // user verbinden
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
