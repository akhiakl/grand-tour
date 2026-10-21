import { Compass } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type Action =
  | { readonly href: string; readonly label: string }
  | { readonly onClick: () => void; readonly label: string };

/**
 * In-voice dead end (404, expired, missing locally, an error) with one way
 * forward, plus an optional way back.
 */
export function OffTheMap({
  title,
  children,
  action,
  secondary,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly action: Action;
  readonly secondary?: { readonly href: string; readonly label: string };
}) {
  const t = useTranslations("Common");
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Compass aria-hidden className="size-10 text-muted-foreground" />
        <p className="eyebrow">{t("offTheMap")}</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-sm text-muted-foreground">{children}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {"href" in action ? (
            <Button asChild variant="brass">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button type="button" variant="brass" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondary && (
            <Button asChild variant="outline">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
