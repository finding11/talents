import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "./ui/button";

export async function SiteHeader() {
  const t = await getTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Finding<span className="text-pitch-400">11</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link href="/discover" className="hover:text-white">
            {t("discover")}
          </Link>
          <Link href="/signup/talent" className="hover:text-white">
            {t("talents")}
          </Link>
          <Link href="/signup/recruiter" className="hover:text-white">
            {t("recruiters")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup/talent">{t("signup")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
