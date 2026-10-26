/**
 * Response security headers, built at config time (next.config.ts) so
 * the CSP allowlist follows the configured third-party hosts. The CSP is
 * static (no nonces) to keep pages statically rendered, hence inline
 * scripts/styles stay allowed; the value is in fencing off where data can
 * be sent and loaded from.
 */

export interface SecurityHeaderOptions {
  dev: boolean;
  /** `NEXT_PUBLIC_MAP_STYLE_URL`; tiles/glyphs must share its origin. */
  mapStyleUrl?: string;
  /** `NEXT_PUBLIC_SENTRY_DSN`; its host receives error reports. */
  sentryDsn?: string;
  /** Vercel preview deployments inject the vercel.live toolbar. */
  vercelPreview: boolean;
}

const OPENFREEMAP = "https://tiles.openfreemap.org";
const PHOTON = "https://photon.komoot.io";
const VERCEL_LIVE = "https://vercel.live";
// Vercel Web Analytics loads its debug script from here in development;
// in production it is served first-party from /_vercel/insights.
const VERCEL_SCRIPTS = "https://va.vercel-scripts.com";

const USERBACK = "https://*.userback.io";

function originOf(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    return new URL(url.trim()).origin;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy(options: SecurityHeaderOptions): string {
  const preview = options.vercelPreview ? [VERCEL_LIVE] : [];
  const userback = [USERBACK];
  const connect = [
    "'self'",
    originOf(options.mapStyleUrl) ?? OPENFREEMAP,
    PHOTON,
    originOf(options.sentryDsn),
    ...userback,
    ...preview,
    ...(options.dev ? ["ws:"] : []),
  ].filter((source): source is string => source !== null);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(options.dev ? ["'unsafe-eval'", VERCEL_SCRIPTS] : []),
      ...userback,
      ...preview,
    ],
    "style-src": ["'self'", "'unsafe-inline'", ...userback],
    "img-src": ["'self'", "data:", "blob:", ...userback, ...preview],
    "font-src": ["'self'", "data:", ...userback, ...preview],
    "connect-src": connect,
    // MapLibre boots its worker from a blob: wrapper around the bundled file.
    "worker-src": ["'self'", "blob:"],
    "frame-src": [...userback, ...preview].length
      ? [...userback, ...preview]
      : ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}

export function securityHeaders(
  options: SecurityHeaderOptions,
): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(options) },
    // Cross-origin requests carry the origin, which OSM-based services
    // (Photon, OpenFreeMap) use to identify the app.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
  ];
}
