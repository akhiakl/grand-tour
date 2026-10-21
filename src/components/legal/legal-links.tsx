import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
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
  return (
    <nav
      aria-label="Legal"
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
          {label}
        </Link>
      ))}
    </nav>
  );
}
