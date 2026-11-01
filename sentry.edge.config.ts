// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    // Capture 100% in dev, 10% in production — adjust based on traffic volume.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // No IPs, user details or request bodies: the privacy notice promises it.
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
  });
}
