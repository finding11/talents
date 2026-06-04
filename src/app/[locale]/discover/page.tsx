import { getDb } from "@/lib/prisma";
import { TalentCard } from "@/components/talent-card";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; position?: string }>;
}) {
  const { locale } = await params;
  const { q, position } = await searchParams;

  const prisma = getDb();
  const talents = await prisma.talentProfile.findMany({
    where: {
      published: true,
      visibility: "PUBLIC",
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { headline: { contains: q, mode: "insensitive" } },
              { tags: { has: q } },
            ],
          }
        : {}),
      ...(position ? { positions: { has: position } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const positions = ["ST", "LW", "RW", "CAM", "CM", "CDM", "CB", "LB", "RB", "GK"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white">Discover talents</h1>
      <p className="mt-2 text-white/60">Browse soccer players ready to be scouted.</p>

      <form className="mt-8 flex flex-wrap gap-4" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or tag…"
          className="h-10 flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
        />
        <select
          name="position"
          defaultValue={position}
          className="h-10 rounded-lg border border-white/10 bg-navy-800 px-3 text-sm text-white"
        >
          <option value="">All positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-pitch-500 px-6 text-sm font-semibold text-white hover:bg-pitch-600"
        >
          Search
        </button>
      </form>

      {talents.length === 0 ? (
        <p className="mt-12 text-center text-white/50">No published profiles yet. Be the first!</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {talents.map((talent) => (
            <TalentCard key={talent.id} talent={talent} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
