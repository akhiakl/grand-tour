import Link from "next/link";

import { LegalLinks } from "./legal-links";

/** Footer for the scrolling pages (about, legal); map pages carry links in the atlas card. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span>Grand Tour · Map data © OpenStreetMap contributors</span>
        <LegalLinks>
          <Link
            href="/about"
            className="rounded-sm underline-offset-4 transition-colors outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            About
          </Link>
        </LegalLinks>
      </div>
    </footer>
  );
}
