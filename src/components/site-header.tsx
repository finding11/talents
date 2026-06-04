import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Link as LocaleLink } from "@/i18n/routing";
import { Button } from "./ui/button";
import { getSession } from "@/lib/session";

export async function SiteHeader() {
  const t = await getTranslations("common");
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <LocaleLink href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Finding<span className="text-pitch-400">11</span>
          </span>
        </LocaleLink>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <LocaleLink href="/discover" className="hover:text-white">
            {t("discover")}
          </LocaleLink>
          <LocaleLink href="/discover" className="hover:text-white">
            {t("talents")}
          </LocaleLink>
          <LocaleLink href="/signup?role=recruiter" className="hover:text-white">
            {t("recruiters")}
          </LocaleLink>
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <LocaleLink href="/dashboard">Dashboard</LocaleLink>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/api/auth/logout">Sign out</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <LocaleLink href="/login">{t("login")}</LocaleLink>
              </Button>
              <Button size="sm" asChild>
                <LocaleLink href="/signup">{t("signup")}</LocaleLink>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
