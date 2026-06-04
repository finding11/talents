import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "./prisma";
import { verifyPassword } from "./password";
import { readRuntimeEnv, requireRuntimeEnv } from "./runtime-env";

export function getAuthOptions(): NextAuthOptions {
  const secret = requireRuntimeEnv("NEXTAUTH_SECRET");
  const url = readRuntimeEnv("NEXTAUTH_URL") ?? readRuntimeEnv("NEXT_PUBLIC_APP_URL");
  if (url) process.env.NEXTAUTH_URL ??= url;

  const useSecureCookies = (url ?? "").startsWith("https://");

  return {
    secret,
    useSecureCookies,
    session: { strategy: "jwt" },
    cookies: {
      sessionToken: {
        name: useSecureCookies
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: useSecureCookies,
        },
      },
    },
    pages: {
      signIn: "/en/login",
      error: "/en/login",
    },
    providers: [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          try {
            if (!credentials?.email || !credentials?.password) return null;

            const prisma = getDb();
            const user = await prisma.user.findUnique({
              where: { email: credentials.email.toLowerCase() },
            });
            if (!user) return null;

            const valid = await verifyPassword(credentials.password, user.passwordHash);
            if (!valid) return null;

            return {
              id: user.id,
              email: user.email,
              role: user.role,
            };
          } catch (error) {
            console.error("authorize failed", error);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.role = (user as { role: string }).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
  };
}
