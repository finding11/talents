import { Link } from "@/i18n/routing";
import type { TalentProfile } from "@prisma/client";
import { formatEUR } from "@/lib/utils";
import { getUnlockPriceCents } from "@/lib/pricing";

type TalentCardProps = {
  talent: TalentProfile;
  locale: string;
};

export async function TalentCard({ talent, locale }: TalentCardProps) {
  const priceCents = await getUnlockPriceCents(talent);

  return (
    <Link
      href={`/talent/${talent.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/10 bg-navy-800/50 transition hover:border-pitch-500/50 hover:shadow-lg hover:shadow-pitch-500/10"
    >
      <div className="aspect-video bg-gradient-to-br from-navy-700 to-pitch-900/30" />
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-pitch-400">{talent.displayName}</h3>
        {talent.headline && (
          <p className="mt-1 text-sm text-white/60 line-clamp-2">{talent.headline}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {talent.positions.slice(0, 2).map((p) => (
            <span key={p} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {p}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/40">
          Unlock from {formatEUR(priceCents, locale)}
        </p>
      </div>
    </Link>
  );
}
