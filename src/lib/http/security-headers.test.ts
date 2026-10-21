import { describe, expect, it } from "vitest";

import {
  contentSecurityPolicy,
  securityHeaders,
  type SecurityHeaderOptions,
} from "./security-headers";

const base: SecurityHeaderOptions = { dev: false, vercelPreview: false };

const directive = (csp: string, name: string) =>
  csp
    .split("; ")
    .find((d) => d.startsWith(`${name} `))
    ?.split(" ")
    .slice(1);

describe("contentSecurityPolicy", () => {
  it("allows the default map and geocoder hosts and blocks framing", () => {
    const csp = contentSecurityPolicy(base);

    expect(directive(csp, "connect-src")).toEqual([
      "'self'",
      "https://tiles.openfreemap.org",
      "https://photon.komoot.io",
    ]);
    expect(directive(csp, "worker-src")).toEqual(["'self'", "blob:"]);
    expect(directive(csp, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(csp, "frame-src")).toEqual(["'none'"]);
    expect(directive(csp, "script-src")).not.toContain("'unsafe-eval'");
  });

  it("swaps in a custom map style origin and the Sentry host", () => {
    const csp = contentSecurityPolicy({
      ...base,
      mapStyleUrl: " https://maps.example.com/styles/a.json ",
      sentryDsn: "https://key@o1.ingest.sentry.io/42",
    });

    expect(directive(csp, "connect-src")).toEqual([
      "'self'",
      "https://maps.example.com",
      "https://photon.komoot.io",
      "https://o1.ingest.sentry.io",
    ]);
  });

  it("ignores malformed or blank URLs", () => {
    const csp = contentSecurityPolicy({
      ...base,
      mapStyleUrl: "not a url",
      sentryDsn: " ",
    });

    expect(directive(csp, "connect-src")).toEqual([
      "'self'",
      "https://tiles.openfreemap.org",
      "https://photon.komoot.io",
    ]);
  });

  it("loosens only what dev and Vercel previews need", () => {
    const csp = contentSecurityPolicy({ dev: true, vercelPreview: true });

    expect(directive(csp, "script-src")).toEqual([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://va.vercel-scripts.com",
      "https://vercel.live",
    ]);
    expect(directive(csp, "connect-src")).toContain("ws:");
    expect(directive(csp, "frame-src")).toEqual(["https://vercel.live"]);
  });
});

describe("securityHeaders", () => {
  it("sends a referrer-carrying policy alongside the CSP", () => {
    const headers = Object.fromEntries(
      securityHeaders(base).map(({ key, value }) => [key, value]),
    );

    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });
});
