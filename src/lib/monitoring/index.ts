/**
 * Error monitoring — public API. Sentry is downloaded only when an error
 * is reported, never in the startup bundle, and is a no-op when
 * NEXT_PUBLIC_SENTRY_DSN is unset. Client-side only; the server registers
 * Sentry in instrumentation.ts.
 */
export * from "./sentry";
