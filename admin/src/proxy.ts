import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected routes (all /admin routes except the login page itself)
  const isProtectedRoute = path.startsWith("/admin") && path !== "/admin";

  if (isProtectedRoute) {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken || adminToken !== "authenticated") {
      // Redirect to admin login page if not authenticated
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};
