import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./password";

const DEMO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const DEMO_EMAILS = [
  "admin@finding11.com",
  "recruiter@finding11.com",
  "talent@finding11.com",
  "elite@finding11.com",
];

export async function seedDemoHighlights(prisma: PrismaClient) {
  for (const [slug, title] of [
    ["alex-rivera", "Winger highlights"],
    ["marco-silva", "Midfield highlights"],
  ] as const) {
    const talent = await prisma.talentProfile.findUnique({ where: { slug } });
    if (!talent) continue;

    await prisma.mediaAsset.deleteMany({ where: { talentId: talent.id } });
    await prisma.mediaAsset.create({
      data: {
        talentId: talent.id,
        type: "video",
        title,
        url: DEMO_VIDEO,
        status: "READY",
        sortOrder: 0,
      },
    });
  }
}

export async function resetDemoPasswords(prisma: PrismaClient) {
  const passwordHash = await hashPassword("demo12345");
  for (const email of DEMO_EMAILS) {
    await prisma.user.updateMany({
      where: { email },
      data: { passwordHash },
    });
  }
}

export async function bootstrapStaging(prisma: PrismaClient) {
  await seedDemoHighlights(prisma);
  await resetDemoPasswords(prisma);
  const mediaCount = await prisma.mediaAsset.count();
  return { mediaCount };
}
