"use client";

import { createTranslator } from "next-intl";
import { useEffect } from "react";

import { DEFAULT_LOCALE } from "@/i18n/config";
import messages from "@/i18n/messages/en.json";
import { captureError } from "@/lib/monitoring";

/**
 * Last-resort error boundary — replaces the root layout, so globals.css and
 * the i18n provider are not available here: styles are inline and copy is
 * read straight from the catalog.
 */
const t = createTranslator({
  locale: DEFAULT_LOCALE,
  messages,
  namespace: "Errors.global",
});
const common = createTranslator({
  locale: DEFAULT_LOCALE,
  messages,
  namespace: "Common",
});
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    captureError(error);
  }, [error]);

  return (
    <html lang={DEFAULT_LOCALE}>
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5f1e8",
          color: "#16233a",
          fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <main>
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#b98a2f",
              fontWeight: 600,
            }}
          >
            {common("offTheMap")}
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.75rem 0 0.5rem" }}>
            {t("title")}
          </h1>
          <p style={{ color: "#4a5568", maxWidth: "26rem", margin: "0 auto" }}>
            {t("body")}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              border: "none",
              background: "#16233a",
              color: "#f5f1e8",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            {t("action")}
          </button>
        </main>
      </body>
    </html>
  );
}
