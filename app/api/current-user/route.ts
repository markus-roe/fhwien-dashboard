import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/data/mockData";
import type {
  UserResponse,
} from "@/lib/api-types";

export async function GET(): Promise<NextResponse<UserResponse>> {
  return NextResponse.json<UserResponse>(currentUser);
}

