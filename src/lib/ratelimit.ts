import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Per-IP sliding-window budgets for the public API routes. */
const LIMITS = {
  trips: { requests: 10, window: "1 h" },
  generate: { requests: 5, window: "1 h" },
} as const satisfies Record<string, { requests: number; window: "1 h" }>;

export type RatelimitName = keyof typeof LIMITS;

const limiters = new Map<RatelimitName, Ratelimit>();

/** Lazily built so importing this module never requires env at build time. */
export function getRatelimiter(name: RatelimitName): Ratelimit {
  const existing = limiters.get(name);
  if (existing) return existing;

  const { requests, window } = LIMITS[name];
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rl:${name}`,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

/** Best-effort client IP for rate limiting behind proxies/CDNs. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "127.0.0.1";
}
