import { NextResponse } from "next/server";
import { getDb } from "@/lib/prisma";
import { hashIp } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const { guardianName, relationship, email, signature } = body;

  const prisma = getDb();
  const consent = await prisma.guardianConsent.findUnique({
    where: { token },
    include: { talentProfile: true },
  });

  if (!consent) {
    return NextResponse.json({ error: "Invalid consent link" }, { status: 404 });
  }

  if (consent.signedAt) {
    return NextResponse.json({ error: "Already signed" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  await prisma.guardianConsent.update({
    where: { id: consent.id },
    data: {
      guardianName: guardianName ?? consent.guardianName,
      relationship: relationship ?? consent.relationship,
      email: email ?? consent.email,
      signedAt: new Date(),
      ipHash: hashIp(ip),
    },
  });

  if (consent.talentProfile) {
    await prisma.talentProfile.update({
      where: { id: consent.talentProfile.id },
      data: { published: true },
    });
  }

  return NextResponse.json({ ok: true, signature });
}
