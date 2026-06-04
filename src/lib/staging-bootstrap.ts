import type { PrismaClient } from "@prisma/client";
import { hashPassword } from "./password";
import { readRuntimeEnv } from "./runtime-env";

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

const PLAYER_HIGHLIGHTS = {
  "marco-silva": {
    title: "Midfield highlights",
    url: "https://videos.pexels.com/video-files/3129679/3129679-uhd_2560_1440_25fps.mp4",
    thumbUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  },
  "alex-rivera": {
    title: "Winger highlights",
    url: "https://videos.pexels.com/video-files/4770682/4770682-hd_1920_1080_24fps.mp4",
    thumbUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
  },
} as const;

export async function seedDemoHighlights(prisma: PrismaClient) {
  for (const [slug, media] of Object.entries(PLAYER_HIGHLIGHTS)) {
    const talent = await prisma.talentProfile.findUnique({ where: { slug } });
    if (!talent) continue;

    await prisma.mediaAsset.deleteMany({ where: { talentId: talent.id } });
    await prisma.mediaAsset.create({
      data: {
        talentId: talent.id,
        type: "video",
        title: media.title,
        url: media.url,
        thumbUrl: media.thumbUrl,
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

export async function needsStagingBootstrap(prisma: PrismaClient): Promise<boolean> {
  const mediaCount = await prisma.mediaAsset.count();
  if (mediaCount === 0) return true;

  const outdated = await prisma.mediaAsset.count({
    where: {
      OR: [
        { url: { contains: "flower.mp4" } },
        { thumbUrl: null },
      ],
    },
  });
  return outdated > 0;
}

export async function bootstrapStaging(prisma: PrismaClient) {
  await seedDemoHighlights(prisma);
  await resetDemoPasswords(prisma);
  const mediaCount = await prisma.mediaAsset.count();
  return { mediaCount };
}
