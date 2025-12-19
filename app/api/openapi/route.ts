import { createSwaggerSpec } from "next-swagger-doc";
import { commonSchemas } from "@/app/api-docs/schemas";

export async function GET() {
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
