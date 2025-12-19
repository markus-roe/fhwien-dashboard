import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/shared/data/mockData";
import type {
  UserResponse,
} from "@/shared/lib/api-types";

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
export async function GET(): Promise<NextResponse<UserResponse>> {
  return NextResponse.json<UserResponse>(currentUser);
}

