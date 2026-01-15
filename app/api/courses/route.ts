import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  CoursesResponse,
  Course,
  Program,
  ApiError,
} from "@/shared/lib/api-types";

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: program
 *         schema:
 *           type: string
 *           enum: [DTI, DI]
 *         description: Filter courses by program (DTI or DI)
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// get: alle kurse holen (optional nach studiengang filtern)
export async function GET(
  request: NextRequest
): Promise<NextResponse<CoursesResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get("program");

    const where: { programs?: { has: Program } } = {};

    if (program) {
      where.programs = {
        has: program as Program,
      };
    }

    const dbCourses = await prisma.course.findMany({
      where,
      orderBy: { title: "asc" },
    });

    // mappen (wir nehmen die id als id, aber im frontend vielleicht code?)
    // hier nehmen wir id
    const courses: Course[] = dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      program: c.programs,
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
