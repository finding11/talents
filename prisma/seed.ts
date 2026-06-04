import { PrismaClient, Role, PricingTier } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

async function seedHighlight(talentSlug: string, title: string) {
  const talent = await prisma.talentProfile.findUnique({ where: { slug: talentSlug } });
  if (!talent) return;

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

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      tierAPriceCents: 5000,
      tierBPriceCents: 7500,
      tierCPriceCents: 9900,
      refundWindowDays: 3,
    },
    update: {},
  });

  const passwordHash = await hash("demo12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@finding11.com" },
    create: { email: "admin@finding11.com", passwordHash, role: Role.ADMIN },
    update: {},
  });

  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@finding11.com" },
    create: { email: "recruiter@finding11.com", passwordHash, role: Role.RECRUITER },
    update: {},
  });

  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter.id },
    create: { userId: recruiter.id, orgName: "FC Demo Scouts", verified: true },
    update: {},
  });

  const talentUser = await prisma.user.upsert({
    where: { email: "talent@finding11.com" },
    create: { email: "talent@finding11.com", passwordHash, role: Role.TALENT },
    update: {},
  });

  await prisma.talentProfile.upsert({
    where: { userId: talentUser.id },
    create: {
      userId: talentUser.id,
      slug: "alex-rivera",
      displayName: "Alex Rivera",
      headline: "Dynamic winger · U19 · Spain",
      bio: "Left-footed winger with pace and vision. Looking for opportunities in Segunda or top academies.",
      positions: ["LW", "ST"],
      country: "Spain",
      city: "Madrid",
      heightCm: 178,
      foot: "LEFT",
      team: "CD Demo Academy",
      league: "Youth Nacional",
      languages: ["Spanish", "English"],
      tags: ["winger", "pace", "youth"],
      published: true,
      visibility: "PUBLIC",
      pricingTier: PricingTier.A,
      privateContact: {
        create: {
          email: "alex.demo@finding11.com",
          phone: "+34 600 000 000",
          agentName: "Demo Agency",
          agentEmail: "agent@finding11.com",
        },
      },
    },
    update: {},
  });

  const eliteUser = await prisma.user.upsert({
    where: { email: "elite@finding11.com" },
    create: { email: "elite@finding11.com", passwordHash, role: Role.TALENT },
    update: {},
  });

  await prisma.talentProfile.upsert({
    where: { userId: eliteUser.id },
    create: {
      userId: eliteUser.id,
      slug: "marco-silva",
      displayName: "Marco Silva",
      headline: "Central midfielder · Pro experience",
      bio: "Box-to-box midfielder with 80+ senior appearances.",
      positions: ["CM", "CDM"],
      country: "Portugal",
      pricingTier: PricingTier.C,
      published: true,
      visibility: "PUBLIC",
      privateContact: {
        create: {
          email: "marco.demo@finding11.com",
          agentOnly: true,
          agentName: "Silva Representation",
          agentEmail: "rep@finding11.com",
          agentPhone: "+351 900 000 000",
        },
      },
    },
    update: {},
  });

  await seedHighlight("alex-rivera", "Winger highlights");
  await seedHighlight("marco-silva", "Midfield highlights");

  console.log("Seed complete. Demo logins (password: demo12345):");
  console.log("  admin@finding11.com (ADMIN)");
  console.log("  recruiter@finding11.com (RECRUITER)");
  console.log("  talent@finding11.com (TALENT)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
