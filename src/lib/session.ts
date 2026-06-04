import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
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
    const headersList = await headers();
    const token = await getToken({
      req: { headers: headersList } as Parameters<typeof getToken>[0]["req"],
      secret: readRuntimeEnv("NEXTAUTH_SECRET"),
    });

    if (!token?.email) return null;

    return {
      user: {
        id: token.id as string,
        email: token.email,
        role: token.role as string,
      },
    };
  } catch {
    return null;
  }
}
