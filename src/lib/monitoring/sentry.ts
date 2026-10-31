type SentryModule = typeof import("@sentry/nextjs");

let loading: Promise<SentryModule | undefined> | undefined;

/** Loads and initialises Sentry once; resolves undefined without a DSN. */
function loadSentry(): Promise<SentryModule | undefined> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return Promise.resolve(undefined);
  loading ??= import("@sentry/nextjs")
    .then((sentry) => {
      sentry.init({
        dsn,
        // No IPs, user details or request bodies: the privacy notice promises it.
        dataCollection: { userInfo: false, httpBodies: [] },
        // watchGlobalErrors reports uncaught errors; Sentry's own handlers
        // would report them twice.
        integrations: (defaults) =>
          defaults.filter((integration) => integration.name !== "GlobalHandlers"),
        // Vercel's preview comment toolbar is not our code.
        denyUrls: [/\/_next-live\//],
      });
      return sentry;
    })
    // A failed download (offline, or a stale chunk after a deploy) must not
    // reject: the unhandledrejection listener would report it, fail again
    // and loop. Forget it so a later error can try again.
    .catch(() => {
      loading = undefined;
      return undefined;
    });
  return loading;
}

/** Reports an error, loading Sentry on first use. */
export function captureError(error: unknown): void {
  void loadSentry().then((sentry) => sentry?.captureException(error));
}

/**
 * Reports uncaught errors and rejections. Sentry is only downloaded when
 * one happens, so it never costs a healthy page load anything.
 */
export function watchGlobalErrors(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  window.addEventListener("error", (event) =>
    captureError(event.error ?? event.message),
  );
  window.addEventListener("unhandledrejection", (event) =>
    captureError(event.reason),
  );
}
