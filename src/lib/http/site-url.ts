/**
 * The site's absolute origin, for metadata that must not be relative
 * (OG image URLs, sitemap, robots). `NEXT_PUBLIC_SITE_URL` wins; Vercel's
 * production host is the fallback; local dev falls back to localhost.
 */
export function siteUrl(
  env: Readonly<Record<string, string | undefined>> = process.env,
): URL {
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL &&
      `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`,
  ];
  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    try {
      return new URL(candidate.trim());
    } catch {
      // Malformed values fall through to the next candidate.
    }
  }
  return new URL(`http://localhost:${env.PORT ?? 3000}`);
}
