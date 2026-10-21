import { Compass } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/** In-voice dead end (404, expired, missing locally) with one way back. */
export function OffTheMap({
  title,
  children,
  action,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly action: { readonly href: string; readonly label: string };
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
        <Button asChild variant="brass" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      </div>
    </main>
  );
}
