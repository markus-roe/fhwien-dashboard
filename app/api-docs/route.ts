import { ApiReference } from "@scalar/nextjs-api-reference";
import { getCurrentUser } from "@/shared/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const config = {
  url: "/api/openapi",
};

// Create the ApiReference handler
const apiReferenceHandler = ApiReference(config);

// Wrapper to check admin access
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/api-docs", request.url)
    );
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  // If admin, delegate to the ApiReference handler
  return apiReferenceHandler(request);
}
