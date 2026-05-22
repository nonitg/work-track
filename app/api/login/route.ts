import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { AUTH_COOKIE, AUTH_MAX_AGE_SECONDS, makeAuthToken } from "@/lib/auth";

function constantTimeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "Passcode not configured" }, { status: 500 });
  }
  let body: { passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body.passcode || !constantTimeEq(body.passcode, expected)) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }
  const token = makeAuthToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });
  return res;
}
