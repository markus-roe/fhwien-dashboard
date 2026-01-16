import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getCurrentUser } from "@/shared/lib/auth";
import type {
  UpdateReportRequest,
  ReportResponse,
  ApiError,
} from "@/shared/lib/api-types";

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Update a report status (admin only)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReportRequest'
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       400:
 *         description: Bad request - invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ReportResponse | ApiError>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can update reports
    if (user.role !== "admin") {
      return NextResponse.json<ApiError>(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateReportRequest;
    const { status } = body;

    if (!status) {
      return NextResponse.json<ApiError>(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    if (
      status !== "open" &&
      status !== "in_progress" &&
      status !== "resolved" &&
      status !== "closed"
    ) {
      return NextResponse.json<ApiError>(
        { error: "Invalid status. Must be 'open', 'in_progress', 'resolved', or 'closed'" },
        { status: 400 }
      );
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json<ApiError>(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const dbReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: status as "open" | "in_progress" | "resolved" | "closed",
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

    return NextResponse.json<ReportResponse>(report);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report (admin only)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean } | ApiError>> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json<ApiError>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only user with ID 32 can delete reports
    if (user.id !== 32) {
      return NextResponse.json<ApiError>(
        { error: "Forbidden - Access denied" },
        { status: 403 }
      );
    }

    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json<ApiError>(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json<ApiError>(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json<{ success: boolean }>({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
