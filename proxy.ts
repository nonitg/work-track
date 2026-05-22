import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*\\.js).*)"],
};

const PUBLIC_PATHS = new Set(["/login", "/api/login"]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (verifyAuthToken(token)) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
