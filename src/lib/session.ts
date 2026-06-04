import { cookies } from "next/headers";
import { sessionCookieName, verifySessionToken } from "./session-token";

export type AppSession = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export async function getSession(): Promise<AppSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName())?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    return {
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
}
