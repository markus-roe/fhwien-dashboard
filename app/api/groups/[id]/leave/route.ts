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

// post: gruppe verlassen
export async function POST(
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
      include: { members: true },
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

    // user aus der gruppe entfernen
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: { id: dbUser.id }, // verbindung trennen
        },
      },
      include: {
        course: true,
        members: true,
      },
    });

    return NextResponse.json<GroupResponse>(mapDbGroupToApiGroup(updatedGroup));
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to leave group" },
      { status: 500 }
    );
  }
}
