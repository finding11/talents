import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { slugify, isMinor } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TALENT", "RECRUITER"]),
  displayName: z.string().min(2).optional(),
  orgName: z.string().optional(),
  birthDate: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianName: z.string().optional(),
  relationship: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const prisma = getDb();
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: body.role,
      },
    });

    if (body.role === "RECRUITER") {
      await prisma.recruiterProfile.create({
        data: {
          userId: user.id,
          orgName: body.orgName,
        },
      });
    }

    if (body.role === "TALENT" && body.displayName) {
      let slug = slugify(body.displayName);
      const slugTaken = await prisma.talentProfile.findUnique({ where: { slug } });
      if (slugTaken) slug = `${slug}-${user.id.slice(-6)}`;

      const birthDate = body.birthDate ? new Date(body.birthDate) : null;
      const minor = birthDate ? isMinor(birthDate) : false;

      let guardianConsentId: string | undefined;
      if (minor && body.guardianEmail && body.guardianName && body.relationship) {
        const consent = await prisma.guardianConsent.create({
          data: {
            guardianName: body.guardianName,
            relationship: body.relationship,
            email: body.guardianEmail,
          },
        });
        guardianConsentId = consent.id;
      }

      const talent = await prisma.talentProfile.create({
        data: {
          userId: user.id,
          slug,
          displayName: body.displayName,
          birthDate,
          guardianConsentId,
          published: minor ? false : false,
          privateContact: { create: {} },
        },
      });

      if (minor && guardianConsentId) {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const consent = await prisma.guardianConsent.findUnique({
          where: { id: guardianConsentId },
        });
        return NextResponse.json({
          ok: true,
          consentUrl: `${base}/en/consent/${consent?.token}`,
          needsConsent: true,
        });
      }

      return NextResponse.json({ ok: true, talentSlug: talent.slug });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const message = e.errors.map((err) => `${err.path.join(".") || "field"}: ${err.message}`).join("; ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    console.error(e);
    const detail = e instanceof Error ? e.message : undefined;
    const isStaging =
      process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_APP_URL?.includes("staging.") ||
      process.env.NEXT_PUBLIC_APP_URL?.includes("workers.dev");

    return NextResponse.json(
      {
        error: "Registration failed",
        ...(isStaging && detail ? { detail } : {}),
      },
      { status: 500 }
    );
  }
}
