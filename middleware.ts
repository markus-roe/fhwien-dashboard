import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access to login page
    if (req.nextUrl.pathname === "/login") {
      return NextResponse.next();
    }

    // Check if user is authenticated
    const token = req.nextauth.token;
    if (!token) {
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
