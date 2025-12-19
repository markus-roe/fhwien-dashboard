import { NextRequest, NextResponse } from "next/server";
import { mockUsers, type User, type Program } from "@/shared/data/mockData";
import type {
  UpdateUserRequest,
  UserResponse,
  ApiError,
  ApiSuccess,
} from "@/shared/lib/api-types";

let users: User[] = [...mockUsers];

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse | ApiError>> {
  const user = users.find((u) => u.id === params.id);

  if (!user) {
    return NextResponse.json<ApiError>(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<UserResponse>(user);
}

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request - invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const body = (await request.json()) as UpdateUserRequest;
    const userIndex = users.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json<ApiError>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingUser = users[userIndex];
    const { name, email, program, initials, role } = body;

    const updatedUser: User = {
      ...existingUser,
      ...(name && { name }),
      ...(email && { email }),
      ...(program && { program: program as Program }),
      ...(initials && { initials }),
      ...(role && { role: role as User["role"] }),
    };

    users[userIndex] = updatedUser;

    return NextResponse.json<UserResponse>(updatedUser);
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiSuccess | ApiError>> {
  const userIndex = users.findIndex((u) => u.id === params.id);

  if (userIndex === -1) {
    return NextResponse.json<ApiError>(
      { error: "User not found" },
      { status: 404 }
    );
  }

  users = users.filter((u) => u.id !== params.id);

  return NextResponse.json<ApiSuccess>({ success: true });
}
