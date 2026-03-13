import { NextResponse } from "next/server";

// Routes only logged-in users (student OR alumni) can access
const PROTECTED_ROUTES = [
  "/connections",
  "/alumni",
  "/dashboard",
  "/profile",
];

// Routes only guests (not logged in) can access
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Check cookie presence — your backend sets an HTTP-only "token" cookie
  const token = req.cookies.get("token")?.value;

  // ── Not logged in, trying to access protected route ──
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname); // so login can redirect back
    return NextResponse.redirect(loginUrl);
  }

  // ── Already logged in, trying to access login/register ──
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on these paths only (skip _next static, api, images)
  matcher: [
    "/connections/:path*",
    "/alumni/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
