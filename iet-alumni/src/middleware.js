// 📁 src/middleware.js

import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/connections", "/alumni", "/dashboard", "/profile", "/complete-profile"];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Skip if route doesn't need any check
  if (!isProtected && !isAuthRoute) return NextResponse.next();

  // Forward the browser's cookies to your backend status check
  const cookieHeader = req.headers.get("cookie") || "";

  let isLoggedIn = false;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/status`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,   // forward cookie so backend can verify the token
      },
      cache: "no-store",        // never cache auth checks
    });

    isLoggedIn = res.ok;
  } catch (err) {
    // If backend is unreachable, treat as not logged in
    isLoggedIn = false;
  }

  // Not logged in → trying to access protected route → redirect to login
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname); // so login page can redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → trying to access login/register → redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/connections/:path*",
    "/alumni/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/complete-profile/:path*",
    "/login",
    "/register",
  ],
};
