import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tag renderers for next-intl `t.rich` messages, defined once at module
 * level so components pass them by reference instead of defining inline
 * render functions (e.g. `t.rich("title", { em: accent })`).
 */
const linkClass = "underline underline-offset-2 hover:text-ink";

/** `<em>`: the brand's italic azure accent word. */
export const accent = (chunks: ReactNode) => (
  <em className="text-azure italic">{chunks}</em>
);

/** `<strong>`: emphasis in ink on soft text. */
export const emphasis = (chunks: ReactNode) => (
  <strong className="font-medium text-ink">{chunks}</strong>
);

/** `<b>`: a highlighted value inside a label. */
export const highlight = (chunks: ReactNode) => (
  <b className="font-semibold text-foreground">{chunks}</b>
);

/** `<privacy>` / `<link>`: the Privacy notice. */
export const privacyLink = (chunks: ReactNode) => (
  <Link href="/privacy" className={linkClass}>
    {chunks}
  </Link>
);

/** `<terms>`: the Terms. */
export const termsLink = (chunks: ReactNode) => (
  <Link href="/terms" className={linkClass}>
    {chunks}
  </Link>
);

/** A `<link>` renderer pointing at `href`. */
export const linkTo = (href: string) =>
  function LinkTag(chunks: ReactNode) {
    return (
      <Link href={href} className={linkClass}>
        {chunks}
      </Link>
    );
  };
