import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";
import type { ApiError, ApiSuccess } from "@/shared/lib/api-types";

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         description: Bad request - invalid request body or password too short
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: User not found or has no password set
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccess | ApiError>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiError>(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json<ApiError>(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Get the user from database to check current password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json<ApiError>(
        { error: "User not found or has no password set" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      dbUser.password
    );

    if (!isPasswordValid) {
      return NextResponse.json<ApiError>(
        { error: "Current password is incorrect" },
        { status: 403 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
