import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  UpdateUserRequest,
  UserResponse,
  User,
  ApiError,
  ApiSuccess,
  Program,
  UserRole,
} from "@/shared/lib/api-types";

// kleine funktion (db user -> api user)
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
// get: user laden per id
export async function GET(
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

    interface UpdateData {
      name?: string;
      email?: string;
      program?: Program;
      initials?: string;
      role?: UserRole;
    }
    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (program) updateData.program = program;
    if (initials) updateData.initials = initials;
    if (role) updateData.role = role;

    const dbUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const updatedUser = mapDbUserToApiUser(dbUser);
    return NextResponse.json<UserResponse>(updatedUser);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
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
 *       201:
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

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json<ApiSuccess>({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
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
