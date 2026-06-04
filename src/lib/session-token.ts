import { readRuntimeEnv, requireRuntimeEnv } from "./runtime-env";

type SessionPayload = {
  id: string;
  email: string;
  role: string;
  exp: number;
};

const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

export function sessionCookieName(): string {
  const url = readRuntimeEnv("NEXTAUTH_URL") ?? readRuntimeEnv("NEXT_PUBLIC_APP_URL") ?? "";
  return url.startsWith("https://") ? "__Secure-finding11.session" : "finding11.session";
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  role: string;
}): Promise<string> {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const secret = requireRuntimeEnv("NEXTAUTH_SECRET");
  const signature = await hmacSha256(secret, body);
  return `${body}.${base64UrlEncode(signature)}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [body, signaturePart] = token.split(".");
    if (!body || !signaturePart) return null;

    const secret = requireRuntimeEnv("NEXTAUTH_SECRET");
    const expected = await hmacSha256(secret, body);
    const actual = base64UrlDecode(signaturePart);
    if (actual.length !== expected.length) return null;

    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    if (diff !== 0) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload;
    if (!payload.id || !payload.email || !payload.role) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  const url = readRuntimeEnv("NEXTAUTH_URL") ?? readRuntimeEnv("NEXT_PUBLIC_APP_URL") ?? "";
  const secure = url.startsWith("https://");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
