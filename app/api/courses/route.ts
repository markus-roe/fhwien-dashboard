import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  GetCoursesQuery,
  CoursesResponse,
  ApiError,
} from "@/shared/lib/api-types";

// get: alle kurse laden
export async function GET(
  request: NextRequest
): Promise<NextResponse<CoursesResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get("program");

    const where: any = {};

    // wenn ein studiengang ausgewählt ist, nur diese kurse zeigen
    if (program) {
      // prisma "has" benutzen weil programs ein array ist
      where.programs = {
        has: program.toUpperCase(),
      };
    }

    // sortiert nach titel ausgeben
    const dbCourses = await prisma.course.findMany({
      where,
      orderBy: { title: "asc" },
    });

    // kurse für das frontend vorbereiten
    const courses = dbCourses.map((c) => ({
      id: c.code, // wir nehmen den code als id (z.b. "ds" oder "hti")
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

