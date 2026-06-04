import { NextResponse } from "next/server";
import { readRuntimeEnv } from "@/lib/runtime-env";
import { sessionCookieName, sessionCookieOptions } from "@/lib/session-token";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const base =
    readRuntimeEnv("NEXT_PUBLIC_APP_URL") ??
    readRuntimeEnv("NEXTAUTH_URL") ??
    "http://localhost:3000";
  const response = NextResponse.redirect(`${base.replace(/\/$/, "")}/en/discover`);
  clearSessionCookie(response);
  return response;
}
