import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/shared/data/mockData";
import type {
  UserResponse,
} from "@/shared/lib/api-types";

export async function GET(): Promise<NextResponse<UserResponse>> {
  return NextResponse.json<UserResponse>(currentUser);
}

