import { NextRequest, NextResponse } from "next/server";
import { mockCourses } from "@/shared/data/mockData";
import type {
  GetCoursesQuery,
  CoursesResponse,
} from "@/shared/lib/api-types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<CoursesResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const program = searchParams.get("program");

  const query: GetCoursesQuery = {};
  if (program) {
    query.program = program as GetCoursesQuery["program"];
  }

  let filteredCourses = mockCourses;

  if (query.program) {
    filteredCourses = mockCourses.filter((c) =>
      c.program.includes(query.program!)
    );
  }

  return NextResponse.json<CoursesResponse>(filteredCourses);
}

