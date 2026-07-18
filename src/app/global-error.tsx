"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Last-resort error boundary — replaces the root layout, so globals.css is
 * not available here; styles must be inline, in-voice and actionable.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
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
            Off the map
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.75rem 0 0.5rem" }}>
            We lost the trail for a moment.
          </h1>
          <p style={{ color: "#4a5568", maxWidth: "26rem", margin: "0 auto" }}>
            Something went wrong on our side. Your maps are safe — try picking up
            where you left off.
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
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
