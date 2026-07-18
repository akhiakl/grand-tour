import * as Sentry from "@sentry/nextjs";

/**
 * Server/edge monitoring bootstrap (Next.js instrumentation hook).
 * A no-op until NEXT_PUBLIC_SENTRY_DSN is configured.
 */
export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
