import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const t = await getTranslations("home");
  const c = await getTranslations("common");

  return (
    <>
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pitch-900/40 via-navy-900 to-navy-900" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-pitch-400">
            {c("tagline")}
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">{t("heroSubtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={{ pathname: "/signup", query: { role: "talent" } }}>{t("ctaTalent")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover">{t("ctaRecruiter")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-navy-800/30 px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            { title: t("featureFree"), desc: "Upload highlights, stats, and bio at no cost." },
            { title: t("featurePay"), desc: "Recruiters pay only when they need your contact details." },
            { title: t("featureSoccer"), desc: "Positions, footedness, league filters built for scouts." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-white/10 p-6">
              <h3 className="font-semibold text-pitch-400">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
