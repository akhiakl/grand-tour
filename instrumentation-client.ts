import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

// Our CSP forbids 'unsafe-eval'; zod's JIT probe (`new Function`) would be
// reported as a violation in DevTools even though zod falls back on its own.
z.config({ jitless: true });

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // No IPs, user details or request bodies: the privacy notice promises it.
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
    // Capture 100% in dev, 10% in production
    // Adjust based on your traffic volume
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // Enable logs to be sent to Sentry (dev only — noisy/costly in prod)
    enableLogs: process.env.NODE_ENV === "development",
  });
}

// This export will instrument router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
