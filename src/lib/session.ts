import { getToken } from "next-auth/jwt";
import { readRuntimeEnv } from "./runtime-env";
import { getRequestCookieHeader } from "./cookies-header";

export type AppSession = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export async function getSession(): Promise<AppSession | null> {
  try {
    const secret = readRuntimeEnv("NEXTAUTH_SECRET");
    if (!secret) return null;

    const url = readRuntimeEnv("NEXTAUTH_URL") ?? readRuntimeEnv("NEXT_PUBLIC_APP_URL") ?? "";
    if (url) process.env.NEXTAUTH_URL ??= url;

    const cookieHeader = await getRequestCookieHeader();
    if (!cookieHeader) return null;

    const token = await getToken({
      req: {
        headers: {
          cookie: cookieHeader,
        },
      } as Parameters<typeof getToken>[0]["req"],
      secret,
      secureCookie: url.startsWith("https://"),
    });

    if (!token?.email || !token.id) return null;

    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
      },
    };
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
}
