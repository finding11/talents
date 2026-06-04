import { Link } from "@/i18n/routing";
import type { MediaAsset, TalentProfile } from "@prisma/client";
import { formatEUR } from "@/lib/utils";
import { getUnlockPriceCents } from "@/lib/pricing";
import { HighlightVideo } from "@/components/highlight-video";

type TalentCardProps = {
  talent: TalentProfile & { media?: MediaAsset[] };
  locale: string;
};

export async function TalentCard({ talent, locale }: TalentCardProps) {
  const priceCents = await getUnlockPriceCents(talent);
  const highlight = talent.media?.[0];

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-navy-800/50 transition hover:border-pitch-500/50 hover:shadow-lg hover:shadow-pitch-500/10">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-navy-700 to-pitch-900/30">
        {highlight?.type === "video" && highlight.url ? (
          <HighlightVideo
            src={highlight.url}
            poster={highlight.thumbUrl}
            title={highlight.title ?? `${talent.displayName} highlights`}
            mode="preview"
            className="h-full w-full object-cover"
          />
        ) : highlight?.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={highlight.thumbUrl}
            alt={highlight.title ?? `${talent.displayName} highlights`}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <Link href={`/talent/${talent.slug}`} className="group block p-4">
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
      </Link>
    </article>
  );
}
