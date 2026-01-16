import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import type { ApiError } from "@/shared/lib/api-types";

/**
 * POST /api/auth/token
 * Authenticate user and return JWT token for mobile app
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ token: string; user: { id: string; email: string; name: string } } | ApiError>> {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiError>(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json<ApiError>(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json<ApiError>(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update lastLoggedIn timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoggedIn: new Date() },
    });

    // Create JWT token using NextAuth's encode function
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[AUTH] NEXTAUTH_SECRET is not set");
      return NextResponse.json<ApiError>(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = await encode({
      token: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role as "student" | "professor" | "admin",
        initials: user.initials,
        program: user.program,
      },
      secret,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error in token authentication:", error);
    return NextResponse.json<ApiError>(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
