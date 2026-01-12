import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { UserResponse, ApiError } from "@/shared/lib/api-types";

// hilfsfunktion (db user -> frontend)
function mapDbUserToApiUser(dbUser: any): any {
  return {
    id: dbUser.id,
    name: dbUser.name,
    initials: dbUser.initials,
    email: dbUser.email,
    program: dbUser.program || "DTI",
    role: dbUser.role || "student",
  };
}

export async function GET(): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    // wir nehmen einfach den ersten user zum testen als eingeloggten user
    // später kommt das aus der session
    const dbUser = await prisma.user.findFirst();

    if (!dbUser) {
      return NextResponse.json<ApiError>(
        { error: "No users found" },
        { status: 404 }
      );
    }

    const user = mapDbUserToApiUser(dbUser);
    return NextResponse.json<UserResponse>(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch current user" },
      { status: 500 }
    );
  }
}

