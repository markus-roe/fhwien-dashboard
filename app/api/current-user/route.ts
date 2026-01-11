import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth";
import type { UserResponse, ApiError } from "@/shared/lib/api-types";

// Helper to map User to API user
function mapUserToApiUser(user: {
  id: number;
  name: string;
  initials: string;
  email: string;
  program?: "DTI" | "DI";
  role: "student" | "professor";
}): UserResponse {
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
    program: user.program,
    role: user.role,
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userResponse = mapUserToApiUser(user);
    return NextResponse.json<UserResponse>(userResponse);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch current user" },
      { status: 500 }
    );
  }
}

