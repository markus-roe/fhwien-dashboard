import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/shared/lib/auth";
import type { UserResponse, ApiError } from "@/shared/lib/api-types";

/**
 * GET /api/current-user
 * Get the current authenticated user
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json<UserResponse>(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch current user" },
      { status: 500 }
    );
  }
}
