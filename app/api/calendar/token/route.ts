import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth";
import { generateCalendarToken } from "@/shared/lib/auth";
import type { ApiError } from "@/shared/lib/api-types";

/**
 * GET /api/calendar/token
 * 
 * Returns the calendar token for the authenticated user.
 * This token can be used to access the calendar feed without session cookies.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<{ token: string } | ApiError>> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = generateCalendarToken(user.id);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating calendar token:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to generate calendar token" },
      { status: 500 }
    );
  }
}
