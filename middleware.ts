import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    // Allow access to login page
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.next();
    }

    // Allow calendar feed with query parameter token (for Google Calendar, etc.)
    if (req.nextUrl.pathname === "/api/calendar/feed.ics") {
      const token = req.nextUrl.searchParams.get("token");
      if (token) {
        // Token will be validated in the route handler
        return NextResponse.next();
      }
      // If no token, continue to check session (for direct browser access)
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
        
        // Allow calendar feed with query parameter token (for Google Calendar, etc.)
        if (req.nextUrl.pathname === "/api/calendar/feed.ics") {
          const queryToken = req.nextUrl.searchParams.get("token");
          if (queryToken) {
            return true; // Token will be validated in the route handler
          }
          // If no token, allow if session exists (for direct browser access)
          return !!token;
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
