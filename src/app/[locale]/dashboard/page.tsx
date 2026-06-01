import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { formatEUR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/en/login");

  if (session.user.role === "TALENT") {
    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.user.id },
    });
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-white">Talent dashboard</h1>
        {profile ? (
          <div className="mt-6 space-y-4">
            <p className="text-white/70">
              Profile: <strong className="text-white">{profile.displayName}</strong>
              {!profile.published && (
                <span className="ml-2 text-amber-400">(not published)</span>
              )}
            </p>
            <Link
              href={`/talent/${profile.slug}`}
              className="inline-block text-pitch-400 hover:underline"
            >
              View public profile →
            </Link>
            <Link
              href="/dashboard/edit"
              className="ml-4 inline-block text-pitch-400 hover:underline"
            >
              Edit profile →
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-white/60">Complete your profile setup.</p>
        )}
      </div>
    );
  }

  if (session.user.role === "RECRUITER" || session.user.role === "ADMIN") {
    const grants = await prisma.accessGrant.findMany({
      where: { recruiterId: session.user.id, revoked: false },
      include: { talent: true },
      orderBy: { createdAt: "desc" },
    });
    const payments = await prisma.payment.findMany({
      where: { recruiterId: session.user.id, status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-white">Recruiter dashboard</h1>
        <p className="mt-2 text-white/60">Your unlocked contacts and payment history.</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">Unlocked talents</h2>
          {grants.length === 0 ? (
            <p className="mt-4 text-sm text-white/50">
              No unlocks yet.{" "}
              <Link href="/discover" className="text-pitch-400 hover:underline">
                Discover talents
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {grants.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/talent/${g.talent.slug}`}
                    className="text-pitch-400 hover:underline"
                  >
                    {g.talent.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">Recent payments</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="text-white/70">
                {formatEUR(p.amountCents)} — {new Date(p.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  redirect("/en");
}
