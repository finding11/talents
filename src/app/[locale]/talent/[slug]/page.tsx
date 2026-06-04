import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { canViewPrivateContact } from "@/lib/access";
import { getUnlockPriceCents } from "@/lib/pricing";
import { ContactGate } from "@/components/contact-gate";
import { isMinor } from "@/lib/utils";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function TalentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ unlocked?: string }>;
}) {
  const { locale, slug } = await params;
  const { unlocked } = await searchParams;
  const session = await getServerSession(authOptions);

  const prisma = getDb();
  const talent = await prisma.talentProfile.findUnique({
    where: { slug },
    include: {
      privateContact: true,
      media: { orderBy: { sortOrder: "asc" } },
      guardianConsent: true,
    },
  });

  if (!talent || (!talent.published && talent.userId !== session?.user?.id)) {
    notFound();
  }

  const canView = await canViewPrivateContact(
    talent.id,
    session?.user?.id,
    session?.user?.role as Role | undefined
  );

  const priceCents = await getUnlockPriceCents(talent);
  const minor = talent.birthDate ? isMinor(talent.birthDate) : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {unlocked === "1" && (
        <div className="mb-6 rounded-lg bg-pitch-500/20 px-4 py-3 text-sm text-pitch-300">
          Payment successful — contact details unlocked below.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{talent.displayName}</h1>
          {talent.headline && <p className="mt-2 text-lg text-white/70">{talent.headline}</p>}
          {minor && (
            <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
              Minor profile
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {talent.positions.map((p) => (
            <span key={p} className="rounded-full bg-pitch-500/20 px-3 py-1 text-sm text-pitch-300">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {talent.bio && (
            <section>
              <h2 className="text-lg font-semibold text-white">Bio</h2>
              <p className="mt-2 whitespace-pre-wrap text-white/70">{talent.bio}</p>
            </section>
          )}

          <section className="grid grid-cols-2 gap-4 text-sm">
            {talent.country && (
              <div>
                <span className="text-white/50">Country</span>
                <p className="text-white">{talent.country}</p>
              </div>
            )}
            {talent.heightCm && (
              <div>
                <span className="text-white/50">Height</span>
                <p className="text-white">{talent.heightCm} cm</p>
              </div>
            )}
            {talent.foot && (
              <div>
                <span className="text-white/50">Foot</span>
                <p className="text-white">{talent.foot}</p>
              </div>
            )}
            {talent.team && (
              <div>
                <span className="text-white/50">Team</span>
                <p className="text-white">{talent.team}</p>
              </div>
            )}
            {talent.league && (
              <div>
                <span className="text-white/50">League</span>
                <p className="text-white">{talent.league}</p>
              </div>
            )}
          </section>

          {talent.media.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white">Highlights</h2>
              <div className="mt-4 space-y-4">
                {talent.media.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-lg border border-white/10">
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        controls
                        className="w-full"
                        poster={m.thumbUrl ?? undefined}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.title ?? "Media"} className="w-full" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div>
          <ContactGate
            talentId={talent.id}
            talentSlug={talent.slug}
            displayName={talent.displayName}
            priceCents={priceCents}
            locale={locale}
            canView={canView}
            contact={canView ? talent.privateContact : null}
          />
        </div>
      </div>
    </div>
  );
}
