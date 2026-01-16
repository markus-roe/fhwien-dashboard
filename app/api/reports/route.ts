import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getCurrentUser } from "@/shared/lib/auth";
import { Resend } from "resend";
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

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        
        const reportTypeLabel = type === "bug_report" ? "Bug Report" : "Feature Request";
        const reportTypeLabelDE = type === "bug_report" ? "Bug Report" : "Feature Request";
        const formattedDate = new Date(dbReport.createdAt).toLocaleString("de-DE", {
          dateStyle: "long",
          timeStyle: "short",
        });

        // Get admin emails or use configured notification email
        const notificationEmail = process.env.NOTIFICATION_EMAIL;
        let adminEmails: string[] = [];
        
        if (notificationEmail) {
          adminEmails = [notificationEmail];
        } else {
          // Fallback: fetch admin emails from database
          const adminUsers = await prisma.user.findMany({
            where: { role: "admin" },
            select: { email: true },
          });
          adminEmails = adminUsers.map((admin) => admin.email);
        }

        // Send notification email to admins
        if (adminEmails.length > 0) {
          const adminEmailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                  body { 
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #171717; 
                    background-color: #fafafa;
                    margin: 0;
                    padding: 0;
                  }
                  .email-container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                  }
                  .header { 
                    background-color: #012f64; 
                    padding: 32px 24px; 
                    color: #ffffff;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: #ffffff;
                  }
                  .content { 
                    padding: 24px; 
                  }
                  .info-row {
                    margin-bottom: 20px;
                  }
                  .label { 
                    font-weight: 600; 
                    color: #52525b; 
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                  }
                  .value { 
                    color: #171717;
                    font-size: 15px;
                    padding: 12px;
                    background-color: #fafafa;
                    border-radius: 6px;
                    border: 1px solid #e4e4e7;
                    word-wrap: break-word;
                  }
                  .description-value {
                    white-space: pre-wrap;
                    line-height: 1.7;
                  }
                  .footer { 
                    margin-top: 32px; 
                    padding-top: 24px; 
                    border-top: 1px solid #e4e4e7; 
                    font-size: 12px; 
                    color: #71717a;
                    text-align: center;
                  }
                  .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    background-color: ${type === "bug_report" ? "#fef2f2" : "#eff6ff"};
                    color: ${type === "bug_report" ? "#dc2626" : "#2563eb"};
                  }
                </style>
              </head>
              <body>
                <div style="padding: 20px;">
                  <div class="email-container">
                    <div class="header">
                      <h1>Neuer ${reportTypeLabelDE}</h1>
                    </div>
                    <div class="content">
                      <div style="margin-bottom: 20px;">
                        <span class="badge">${reportTypeLabelDE}</span>
                      </div>
                      
                      <div class="info-row">
                        <div class="label">Von</div>
                        <div class="value">${dbReport.user.name} (${dbReport.user.email})</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="label">Titel</div>
                        <div class="value">${title}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="label">Beschreibung</div>
                        <div class="value description-value">${description.replace(/\n/g, "\n")}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="label">Erstellt am</div>
                        <div class="value">${formattedDate}</div>
                      </div>
                      
                      <div class="info-row">
                        <div class="label">Report ID</div>
                        <div class="value">#${dbReport.id}</div>
                      </div>
                    </div>
                    <div class="footer">
                      <p>FH Wien Dashboard - Automatische Benachrichtigung</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `;

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: adminEmails,
            subject: `Neuer ${reportTypeLabelDE}: ${title}`,
            html: adminEmailHtml,
          });
        }

        // Send confirmation email to the user who submitted the report
        const confirmationEmailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                body { 
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #171717; 
                  background-color: #fafafa;
                  margin: 0;
                  padding: 0;
                }
                .email-container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .header { 
                  background-color: #012f64; 
                  padding: 32px 24px; 
                  color: #ffffff;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: 600;
                  color: #ffffff;
                }
                .content { 
                  padding: 24px; 
                }
                .greeting {
                  font-size: 16px;
                  color: #171717;
                  margin-bottom: 16px;
                }
                .message {
                  font-size: 15px;
                  color: #52525b;
                  line-height: 1.7;
                  margin-bottom: 24px;
                }
                .report-summary {
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 6px;
                  padding: 20px;
                  margin: 24px 0;
                }
                .summary-title {
                  font-weight: 600;
                  color: #171717;
                  font-size: 14px;
                  margin-bottom: 12px;
                }
                .summary-item {
                  margin-bottom: 12px;
                  font-size: 14px;
                }
                .summary-label {
                  color: #71717a;
                  font-size: 13px;
                  margin-bottom: 4px;
                }
                .summary-value {
                  color: #171717;
                  font-weight: 500;
                }
                .footer { 
                  margin-top: 32px; 
                  padding-top: 24px; 
                  border-top: 1px solid #e4e4e7; 
                  font-size: 12px; 
                  color: #71717a;
                  text-align: center;
                }
                .badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                  background-color: ${type === "bug_report" ? "#fef2f2" : "#eff6ff"};
                  color: ${type === "bug_report" ? "#dc2626" : "#2563eb"};
                }
              </style>
            </head>
            <body>
              <div style="padding: 20px;">
                <div class="email-container">
                  <div class="header">
                    <h1>Report erfolgreich eingereicht</h1>
                  </div>
                  <div class="content">
                    <div class="greeting">Hallo ${dbReport.user.name},</div>
                    <div class="message">
                      vielen Dank für dein Feedback! Dein ${reportTypeLabelDE.toLowerCase()} wurde erfolgreich eingereicht und wird von unserem Team bearbeitet.
                    </div>
                    
                    <div class="report-summary">
                      <div class="summary-title">Dein Report im Überblick:</div>
                      <div class="summary-item">
                        <div class="summary-label">Typ</div>
                        <div class="summary-value">
                          <span class="badge">${reportTypeLabelDE}</span>
                        </div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">Titel</div>
                        <div class="summary-value">${title}</div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">Beschreibung</div>
                        <div class="summary-value" style="white-space: pre-wrap; line-height: 1.6;">${description}</div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">Report ID</div>
                        <div class="summary-value">#${dbReport.id}</div>
                      </div>
                      <div class="summary-item" style="margin-bottom: 0;">
                        <div class="summary-label">Eingereicht am</div>
                        <div class="summary-value">${formattedDate}</div>
                      </div>
                    </div>
                    
                    <div class="message">
                      Wir werden uns so schnell wie möglich um deinen ${reportTypeLabelDE.toLowerCase()} kümmern. Du wirst über Updates informiert.
                    </div>
                  </div>
                  <div class="footer">
                    <p>FH Wien Dashboard - DTI/DI</p>
                    <p style="margin-top: 8px;">Dies ist eine automatische Bestätigungs-E-Mail.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: dbReport.user.email,
          subject: `Bestätigung: Dein ${reportTypeLabelDE} wurde eingereicht`,
          html: confirmationEmailHtml,
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Error sending email notifications:", emailError);
    }

    return NextResponse.json<ReportResponse>(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
