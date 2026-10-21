// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    // Capture 100% in dev, 10% in production — adjust based on traffic volume.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Enable logs to be sent to Sentry (dev only — noisy/costly in prod)
    enableLogs: process.env.NODE_ENV === "development",

    // No IPs, user details or request bodies: the privacy notice promises it.
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
  });
}
