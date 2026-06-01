import type { PricingTier, SiteSettings, TalentProfile } from "@prisma/client";
import { prisma } from "./prisma";

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings) return settings;
  return prisma.siteSettings.create({
    data: {
      id: "default",
      tierAPriceCents: 5000,
      tierBPriceCents: 7500,
      tierCPriceCents: 9900,
      refundWindowDays: parseInt(process.env.REFUND_DAYS ?? "3", 10),
    },
  });
}

export function priceForTier(
  tier: PricingTier,
  settings: SiteSettings,
  customPriceCents?: number | null
): number {
  if (tier === "CUSTOM" && customPriceCents) return customPriceCents;
  switch (tier) {
    case "B":
      return settings.tierBPriceCents;
    case "C":
      return settings.tierCPriceCents;
    case "A":
    default:
      return settings.tierAPriceCents;
  }
}

export async function getUnlockPriceCents(talent: Pick<TalentProfile, "pricingTier" | "customPriceCents">) {
  const settings = await getSiteSettings();
  return priceForTier(talent.pricingTier, settings, talent.customPriceCents);
}
