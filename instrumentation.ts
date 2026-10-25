import * as Sentry from "@sentry/nextjs";

import { emit, flushLogs } from "@/lib/logging";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
// Capture errors from Server Components, middleware, and proxies. The log
// line carries the route pattern and digest only, never the error message.
export async function onRequestError(
  ...args: Parameters<typeof Sentry.captureRequestError>
) {
  Sentry.captureRequestError(...args);
  const [error, , context] = args;
  emit("error", "request failed", {
    route: context.routePath,
    routeType: context.routeType,
    errorName: error instanceof Error ? error.name : "unknown",
    digest:
      typeof error === "object" && error !== null && "digest" in error
        ? String(error.digest)
        : undefined,
  });
  await flushLogs();
}
