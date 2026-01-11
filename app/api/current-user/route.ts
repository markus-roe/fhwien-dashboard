import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { UserResponse, ApiError } from "@/shared/lib/api-types";

// Helper to map DB user to API user
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

/**
 * @swagger
 * /api/current-user:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 */
export async function GET(): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    // For now, we just get the first user to simulate a logged-in user
    // In a real app, this would get the user from the session
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

