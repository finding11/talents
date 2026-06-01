import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/pricing";
import { formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/en/login");

  const settings = await getSiteSettings();
  const pendingTalents = await prisma.talentProfile.findMany({
    where: { published: false },
    take: 20,
  });
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { talent: true },
  });
  const consents = await prisma.guardianConsent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { talentProfile: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold text-white">Admin — Finding11</h1>

      <section className="mt-8 rounded-xl border border-white/10 p-6">
        <h2 className="font-semibold text-pitch-400">Pricing tiers</h2>
        <ul className="mt-4 space-y-1 text-sm text-white/70">
          <li>Tier A: {formatEUR(settings.tierAPriceCents)}</li>
          <li>Tier B: {formatEUR(settings.tierBPriceCents)}</li>
          <li>Tier C: {formatEUR(settings.tierCPriceCents)}</li>
          <li>Refund window: {settings.refundWindowDays} days</li>
        </ul>
        <p className="mt-2 text-xs text-white/40">
          Custom per-talent overrides supported via pricingTier=CUSTOM
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-white">Unpublished profiles</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {pendingTalents.map((t) => (
            <li key={t.id} className="text-white/70">
              {t.displayName} — /talent/{t.slug}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-white">Recent payments</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          {payments.map((p) => (
            <li key={p.id}>
              {p.talent.displayName} — {formatEUR(p.amountCents)} — {p.status}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-white">Guardian consents</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          {consents.map((c) => (
            <li key={c.id}>
              {c.guardianName} — {c.signedAt ? "Signed" : "Pending"} —{" "}
              {c.talentProfile?.displayName ?? "—"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
