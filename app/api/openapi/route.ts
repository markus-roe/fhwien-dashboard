import { createSwaggerSpec } from "next-swagger-doc";
import { commonSchemas } from "@/app/api-docs/schemas";
import { getCurrentUser } from "@/shared/lib/auth";
import { NextResponse } from "next/server";

// get: swagger json holen (nur für Admins)
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "FH Wien Dashboard API",
        version: "1.0.0",
        description: "API documentation for the FH Wien Dashboard application",
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          description: "Backend API",
        },
      ],
      components: {
        schemas: commonSchemas,
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apiFolder: "app/api",
  });

  return Response.json(spec);
}
