import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  CreateUserRequest,
  GetUsersQuery,
  UsersResponse,
  UserResponse,
  ApiError,
} from "@/shared/lib/api-types";
import type { User } from "@/shared/data/mockData";

// Helper function to map DB user to API user format
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
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: program
 *         schema:
 *           type: string
 *         description: Filter by program (e.g., "DTI", "all")
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UsersResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get("program");
    const search = searchParams.get("search");

    const query: GetUsersQuery = {};
    if (program) {
      query.program = program as GetUsersQuery["program"];
    }
    if (search) {
      query.search = search;
    }

    // Build Prisma query
    const where: any = {};

    if (query.program && query.program !== "all") {
      where.program = query.program.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const dbUsers = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const filteredUsers = dbUsers.map(mapDbUserToApiUser);

    return NextResponse.json<UsersResponse>(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateUserRequest;
    const { name, email, program, initials, role = "student" } = body;

    if (!name || !email || !program) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiError>(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        program: program.toUpperCase() as "DTI" | "DI",
        initials: initials || name.substring(0, 2).toUpperCase(),
        role: role.toLowerCase() as "student" | "professor",
      },
    });

    const newUser = mapDbUserToApiUser(dbUser);

    return NextResponse.json<UserResponse>(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
