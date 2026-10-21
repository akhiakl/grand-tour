"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** The address as selectable text, a mail link and a copy button. */
export function CopyEmail({ email }: { readonly email: string }) {
  const t = useTranslations("Legal");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The address stays visible and selectable; nothing else to do.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="font-display text-2xl text-ink underline-offset-4 select-all hover:underline"
      >
        {email}
      </a>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? <Check /> : <Copy />}
        {copied ? t("copied") : t("copy")}
      </Button>
    </div>
  );
}
