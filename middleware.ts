import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PAGES = ["/dashboard", "/clients", "/uploads", "/settings"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("profitlens_token")?.value;

  const isProtectedPage = PROTECTED_PAGES.some((route) => pathname.startsWith(route));
  const isAuthPage = AUTH_PAGES.some((route) => pathname.startsWith(route));
  const isProtectedApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/health");

  let isValidSession = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "profitlens-local-dev-jwt-secret-key-360-min16"
      );
      await jwtVerify(token, secret);
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // 1. Guard protected web pages
  if (isProtectedPage && !isValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete("profitlens_token");
    }
    return response;
  }

  // 2. Guard protected API routes
  if (isProtectedApi && !isValidSession) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or expired session" },
      { status: 401 }
    );
  }

  // 3. Prevent logged-in users from accessing login/signup
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/uploads/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/api/:path*",
  ],
};
