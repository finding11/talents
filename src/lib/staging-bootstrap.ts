import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./password";
import { readRuntimeEnv } from "./runtime-env";
import { DEMO_PLAYER_HIGHLIGHTS, isBrokenDemoVideoUrl } from "./demo-media";

export function isStagingHost(): boolean {
  const url = readRuntimeEnv("NEXT_PUBLIC_APP_URL") ?? readRuntimeEnv("NEXTAUTH_URL") ?? "";
  return url.includes("workers.dev") || url.includes("staging.");
}

const DEMO_EMAILS = [
  "admin@finding11.com",
  "recruiter@finding11.com",
  "talent@finding11.com",
  "elite@finding11.com",
];

export async function seedDemoHighlights(prisma: PrismaClient) {
  for (const [slug, highlights] of Object.entries(DEMO_PLAYER_HIGHLIGHTS)) {
    const talent = await prisma.talentProfile.findUnique({ where: { slug } });
    if (!talent) continue;

    await prisma.mediaAsset.deleteMany({ where: { talentId: talent.id } });

    for (const [index, media] of highlights.entries()) {
      await prisma.mediaAsset.create({
        data: {
          talentId: talent.id,
          type: "video",
          title: media.title,
          url: media.url,
          thumbUrl: media.thumbUrl,
          status: "READY",
          sortOrder: index,
        },
      });
    }
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

export async function needsStagingBootstrap(prisma: PrismaClient): Promise<boolean> {
  const mediaCount = await prisma.mediaAsset.count();
  if (mediaCount === 0) return true;

  const allMedia = await prisma.mediaAsset.findMany({ select: { url: true, thumbUrl: true } });
  const outdated = allMedia.some(
    (m) => isBrokenDemoVideoUrl(m.url) || !m.thumbUrl
  );
  const expectedCount = Object.values(DEMO_PLAYER_HIGHLIGHTS).reduce((n, h) => n + h.length, 0);

  return outdated || mediaCount < expectedCount;
}

export async function bootstrapStaging(prisma: PrismaClient) {
  await seedDemoHighlights(prisma);
  await resetDemoPasswords(prisma);
  const mediaCount = await prisma.mediaAsset.count();
  return { mediaCount };
}
