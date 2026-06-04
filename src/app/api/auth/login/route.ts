import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createSessionToken,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/session-token";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["TALENT", "RECRUITER"]),
});

export async function POST(req: Request) {
  try {
    const { email, password, role } = schema.parse(await req.json());
    const prisma = getDb();
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.role !== role && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            role === "TALENT"
              ? "This email belongs to a recruiter account. Switch to Recruiter above."
              : "This email belongs to a talent account. Switch to Talent above.",
        },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    response.cookies.set(sessionCookieName(), token, sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("login failed", error);
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }
}
