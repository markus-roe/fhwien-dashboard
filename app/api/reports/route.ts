import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getCurrentUser } from "@/shared/lib/auth";
import type {
  CreateReportRequest,
  GetReportsQuery,
  ReportsResponse,
  ReportResponse,
  ApiError,
} from "@/shared/lib/api-types";

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (admin only)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [feature_request, bug_report]
 *         description: Filter by type
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ReportsResponse | ApiError>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can view all reports
    if (user.role !== "admin") {
      return NextResponse.json<ApiError>(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      const userIdNum = parseInt(userId, 10);
      if (!isNaN(userIdNum)) {
        where.userId = userIdNum;
      }
    }

    const dbReports = await prisma.report.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
            email: true,
            program: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const reports = dbReports.map((report) => ({
      id: report.id,
      type: report.type as "feature_request" | "bug_report",
      title: report.title,
      description: report.description,
      status: report.status as "open" | "in_progress" | "resolved" | "closed",
      userId: report.userId,
      user: {
        id: report.user.id,
        name: report.user.name,
        initials: report.user.initials,
        email: report.user.email,
        program: (report.user.program as "DTI" | "DI") || "DTI",
        role: (report.user.role as "student" | "professor" | "admin") || "student",
      },
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));

    return NextResponse.json<ReportsResponse>(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report (feature request or bug report)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportRequest'
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ReportResponse | ApiError>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateReportRequest;
    const { type, title, description } = body;

    if (!type || !title || !description) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields: type, title, and description are required" },
        { status: 400 }
      );
    }

    if (type !== "feature_request" && type !== "bug_report") {
      return NextResponse.json<ApiError>(
        { error: "Invalid type. Must be 'feature_request' or 'bug_report'" },
        { status: 400 }
      );
    }

    if (!title.trim() || !description.trim()) {
      return NextResponse.json<ApiError>(
        { error: "Title and description cannot be empty" },
        { status: 400 }
      );
    }

    const dbReport = await prisma.report.create({
      data: {
        type: type as "feature_request" | "bug_report",
        title: title.trim(),
        description: description.trim(),
        status: "open",
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
            email: true,
            program: true,
            role: true,
          },
        },
      },
    });

    const report: ReportResponse = {
      id: dbReport.id,
      type: dbReport.type as "feature_request" | "bug_report",
      title: dbReport.title,
      description: dbReport.description,
      status: dbReport.status as "open" | "in_progress" | "resolved" | "closed",
      userId: dbReport.userId,
      user: {
        id: dbReport.user.id,
        name: dbReport.user.name,
        initials: dbReport.user.initials,
        email: dbReport.user.email,
        program: (dbReport.user.program as "DTI" | "DI") || "DTI",
        role: (dbReport.user.role as "student" | "professor" | "admin") || "student",
      },
      createdAt: dbReport.createdAt,
      updatedAt: dbReport.updatedAt,
    };

    return NextResponse.json<ReportResponse>(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
