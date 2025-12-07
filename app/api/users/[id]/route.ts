import { NextRequest, NextResponse } from "next/server";
import { mockUsers, type User, type Program } from "@/data/mockData";
import type {
  UpdateUserRequest,
  UserResponse,
  ApiError,
  ApiSuccess,
} from "@/lib/api-types";

let users: User[] = [...mockUsers];

// Get a user by id
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
