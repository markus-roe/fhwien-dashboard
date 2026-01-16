import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    // Allow access to login page
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.next();
    }

    // For API routes, check for Bearer token authentication (mobile app)
    if (req.nextUrl.pathname.startsWith("/api/") && !req.nextUrl.pathname.startsWith("/api/auth")) {
      const authHeader = req.headers.get("authorization");
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const secret = process.env.NEXTAUTH_SECRET;

        if (secret) {
          try {
            const decoded = await decode({
              token,
              secret,
            });

            if (decoded && decoded.id) {
              // Valid Bearer token, allow request
              return NextResponse.next();
            }
          } catch (error) {
            // Invalid token, continue to check session
          }
        }
      }
    }

    // Check if user is authenticated via session (web)
    const token = req.nextauth.token;
    if (!token) {
      // For API routes, return 401 instead of redirect
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ["/login", "/api/auth"];
        if (publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
          return true;
        }
        
        // For API routes, allow if Bearer token is present (checked in middleware function)
        if (req.nextUrl.pathname.startsWith("/api/")) {
          const authHeader = req.headers.get("authorization");
          if (authHeader && authHeader.startsWith("Bearer ")) {
            return true; // Will be validated in middleware function
          }
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
