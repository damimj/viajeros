/**
 * Service Worker — Tile Cache for Viajeros
 *
 * Caches map tiles for offline usage (same strategy as the original TravelMap).
 * Handles tiles from OpenStreetMap-based tile servers and MapTiler.
 *
 * Strategy: Network-first for tiles, falling back to cache.
 * Max ~2000 tiles cached (~100MB).
 */

const TILE_CACHE_NAME = "viajeros-tiles-v1";
const MAX_CACHE_ITEMS = 2000;

const TILE_DOMAINS = [
  "tile.openstreetmap.org",
  "tiles.stadiamaps.com",
  "basemaps.cartocdn.com",
  "api.maptiler.com",
  "demotiles.maplibre.org",
];

function isTileRequest(url) {
  return TILE_DOMAINS.some((domain) => url.hostname.includes(domain));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== TILE_CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (!isTileRequest(url)) return;

  event.respondWith(
    fetch(event.request)
      .then(async (networkResponse) => {
        if (networkResponse.ok) {
          const cache = await caches.open(TILE_CACHE_NAME);

          // Evict old entries if over limit
          const keys = await cache.keys();
          if (keys.length >= MAX_CACHE_ITEMS) {
            const toDelete = keys.slice(0, keys.length - MAX_CACHE_ITEMS + 100);
            await Promise.all(toDelete.map((key) => cache.delete(key)));
          }

          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || new Response("Tile not available offline", { status: 503 });
      }),
  );
});
