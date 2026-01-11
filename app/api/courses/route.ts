import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  GetCoursesQuery,
  CoursesResponse,
  ApiError,
} from "@/shared/lib/api-types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<CoursesResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get("program");

    const where: any = {};

    if (program) {
      // Prisma supports checking if array contains value
      where.programs = {
        has: program.toUpperCase(),
      };
    }

    const dbCourses = await prisma.course.findMany({
      where,
      orderBy: { title: "asc" },
    });

    const courses = dbCourses.map((c) => ({
      id: c.code, // We use 'code' field as the ID for API compatibility (e.g. "ds", "hti")
      title: c.title,
      program: c.programs as any[],
    }));

    return NextResponse.json<CoursesResponse>(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

