import { NextRequest, NextResponse } from "next/server";
import { mockUsers, type User, type Program } from "@/data/mockData";
import type {
  CreateUserRequest,
  GetUsersQuery,
  UsersResponse,
  UserResponse,
  ApiError,
} from "@/lib/api-types";

let users: User[] = [...mockUsers];

export async function GET(
  request: NextRequest
): Promise<NextResponse<UsersResponse | ApiError>> {
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

  //gefilterte User
  let filteredUsers = users;

  if (query.program && query.program !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.program === query.program);
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json<UsersResponse>(filteredUsers);
}
// create new user
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

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      program: program as Program,
      initials: initials || name.substring(0, 2).toUpperCase(),
      role: role as User["role"],
    };

    users.push(newUser);

    return NextResponse.json<UserResponse>(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
