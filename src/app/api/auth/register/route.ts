import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hash(body.password, 12);
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
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
