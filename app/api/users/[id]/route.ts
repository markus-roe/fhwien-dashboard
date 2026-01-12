import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  UpdateUserRequest,
  UserResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";
import type { User } from "@/shared/data/mockData";

// kleine funktion um db user in api user umzuwandeln (kopiert)
function mapDbUserToApiUser(dbUser: {
  id: number;
  name: string;
  initials: string;
  email: string;
  program: string | null;
  role: string | null;
}): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    initials: dbUser.initials,
    email: dbUser.email,
    program: (dbUser.program as "DTI" | "DI") || "DTI",
    role: (dbUser.role as "student" | "professor") || "student",
  };
}

// get: einen user mit id laden
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const userId = parseInt(params.id, 10);

    // checken ob id zahl ist
    if (isNaN(userId)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // user suchen
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = mapDbUserToApiUser(dbUser);
    return NextResponse.json<UserResponse>(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// put: user bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateUserRequest;
    const { name, email, program, initials, role } = body;

    // nur das updaten was auch geschickt wurde
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (program) updateData.program = program.toUpperCase();
    if (initials) updateData.initials = initials;
    if (role) updateData.role = role.toLowerCase();

    // update in datenbank machen
    const dbUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const updatedUser = mapDbUserToApiUser(dbUser);
    return NextResponse.json<UserResponse>(updatedUser);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// delete: user löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // einfach löschen
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
