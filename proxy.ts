import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ENCRYPTION_KEY || "chalo-care-clinic-portal-secure-key-32-chars"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude public assets, static files, and APIs
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") || 
    pathname === "/" || 
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("chalo_session")?.value;
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  // If no session token, redirect to sign-in for secured dashboard pages
  if (!sessionToken) {
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // Parse and verify session token role
  try {
    const { payload } = await jwtVerify(sessionToken, SECRET, {
      algorithms: ["HS256"],
    });
    
    const role = (payload.role as string)?.toUpperCase();

    if (isAuthPage) {
      // Redirect authenticated users trying to access login/signup to their dashboard
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }

    // Protect role-specific routes
    if (pathname.startsWith("/patient") && role !== "PATIENT") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith("/doctor") && role !== "DOCTOR") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url));
    }

  } catch {
    // Session token expired or invalid, clear it and redirect to login
    if (!isAuthPage) {
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("chalo_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/patient",
    "/patient/:path*", 
    "/doctor",
    "/doctor/:path*", 
    "/admin",
    "/admin/:path*", 
    "/sign-in", 
    "/sign-up"
  ],
};
