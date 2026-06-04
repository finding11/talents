import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function handleAuth(req: Request, context: RouteContext) {
  const handler = NextAuth(getAuthOptions());
  return handler(req, context);
}

export { handleAuth as GET, handleAuth as POST };
