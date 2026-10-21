import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/contact", label: "contact" },
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
] as const;

/** Contact · Privacy · Terms, quiet enough to sit under any surface. */
export function LegalLinks({
  className,
  children,
}: {
  readonly className?: string;
  /** Extra items placed before the standard links (e.g. a report link). */
  readonly children?: ReactNode;
}) {
  const t = useTranslations("Legal");
  return (
    <nav
      aria-label={t("navLabel")}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="rounded-sm underline-offset-4 transition-colors outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t(label)}
        </Link>
      ))}
    </nav>
  );
}
