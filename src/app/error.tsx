"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { OffTheMap } from "@/components/off-the-map";
import { captureError } from "@/lib/monitoring";

/**
 * Route error boundary: keeps the layout, theme and copy that the
 * last-resort global-error.tsx can't, and offers a retry.
 */
export default function RouteError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const t = useTranslations("Errors");

  useEffect(() => {
    captureError(error);
  }, [error]);

  return (
    <OffTheMap
      title={t("global.title")}
      action={{ onClick: reset, label: t("global.action") }}
      secondary={{ href: "/", label: t("notFound.action") }}
    >
      {t("global.body")}
    </OffTheMap>
  );
}
