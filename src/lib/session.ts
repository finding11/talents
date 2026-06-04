import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { readRuntimeEnv } from "./runtime-env";

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

    const cookieStore = await cookies();
    const token = await getToken({
      req: {
        headers: {
          cookie: cookieStore.toString(),
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
