import Link from "next/link";
import { useTranslations } from "next-intl";

import { LegalLinks } from "./legal-links";

/** Footer for the scrolling pages (about, legal); map pages carry links in the atlas card. */
export function SiteFooter() {
  const t = useTranslations("Legal");
  return (
    <footer className="border-t border-line">
      <div className="page-container flex flex-wrap items-center justify-between gap-3 py-8 text-sm text-muted-foreground">
        <span>{t("footerCredit")}</span>
        <LegalLinks>
          <Link
            href="/about"
            className="rounded-sm underline-offset-4 transition-colors outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("about")}
          </Link>
        </LegalLinks>
      </div>
    </footer>
  );
}
