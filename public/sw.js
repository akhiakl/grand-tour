/*
 * Grand Tour service worker — keeps maps you have opened readable offline
 * (travellers on roaming data). Registered by components/service-worker.tsx
 * in production builds only. Strategies:
 *   - pages (and their RSC payloads): network first, cached copy offline,
 *     the /offline page when nothing was cached;
 *   - hashed build assets and brand icons: cache first (immutable);
 *   - /api/rates: network first; every other API call: network only;
 *   - basemap tiles, glyphs and sprites (origin passed as ?tiles=):
 *     stale-while-revalidate, capped so the cache can't grow unbounded.
 */
const VERSION = "v1";
const PAGES = `gt-pages-${VERSION}`;
const STATIC = `gt-static-${VERSION}`;
const TILES = `gt-tiles-${VERSION}`;
const CACHES = [PAGES, STATIC, TILES];
const OFFLINE_URL = "/offline";
const MAX_TILES = 1500;
const TILE_ORIGIN = new URL(self.location.href).searchParams.get("tiles");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("gt-") && !CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName, isNavigation) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigation) {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

let tilePuts = 0;

async function trimTiles(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_TILES;
  // keys() lists the oldest entries first.
  for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request).then(async (response) => {
    if (response.ok) {
      await cache.put(event.request, response.clone());
      tilePuts += 1;
      if (tilePuts % 50 === 0) await trimTiles(cache);
    }
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }
  return refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    const path = url.pathname;
    if (path.startsWith("/_next/static/") || path.startsWith("/icons/")) {
      event.respondWith(cacheFirst(request, STATIC));
    } else if (path === "/api/rates") {
      event.respondWith(networkFirst(request, PAGES, false));
    } else if (path.startsWith("/api/") || path === "/sw.js") {
      return;
    } else if (request.mode === "navigate" || request.headers.get("RSC") === "1") {
      event.respondWith(networkFirst(request, PAGES, request.mode === "navigate"));
    }
    return;
  }

  if (TILE_ORIGIN && url.origin === TILE_ORIGIN) {
    event.respondWith(staleWhileRevalidate(event, TILES));
  }
});
