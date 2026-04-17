/**
 * Viajeros — Service Worker v2
 *
 * Strategies:
 * - Tile cache: Network-first with cache fallback (max ~2000 tiles)
 * - App shell: Cache-first for static assets (_next/static)
 * - API: Network-only (no caching)
 * - Navigation: Network-first with offline fallback page
 */

const TILE_CACHE = "viajeros-tiles-v2";
const STATIC_CACHE = "viajeros-static-v2";
const MAX_TILE_ITEMS = 2000;

const TILE_DOMAINS = [
  "tile.openstreetmap.org",
  "tiles.stadiamaps.com",
  "basemaps.cartocdn.com",
  "api.maptiler.com",
  "demotiles.maplibre.org",
];

function isTileRequest(url) {
  return TILE_DOMAINS.some((d) => url.hostname.includes(d));
}

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json";
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

// --- Install ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(["/manifest.json"]);
    }),
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== TILE_CACHE && n !== STATIC_CACHE)
          .map((n) => caches.delete(n)),
      ),
    ),
  );
  self.clients.claim();
});

// --- Fetch ---
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // API requests: network only
  if (isApiRequest(url)) return;

  // Tile requests: network-first + cache
  if (isTileRequest(url)) {
    event.respondWith(handleTileRequest(event.request));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(event.request));
    return;
  }

  // Navigation: network-first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/") || new Response(
          "<html><body><h1>Viajeros</h1><p>You are offline. Please check your connection.</p></body></html>",
          { headers: { "Content-Type": "text/html" } },
        );
      }),
    );
    return;
  }
});

async function handleTileRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(TILE_CACHE);
      // Evict old entries if over limit
      const keys = await cache.keys();
      if (keys.length >= MAX_TILE_ITEMS) {
        const toDelete = keys.slice(0, keys.length - MAX_TILE_ITEMS + 100);
        await Promise.all(toDelete.map((k) => cache.delete(k)));
      }
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Tile not available offline", { status: 503 });
  }
}

async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response("Asset not available offline", { status: 503 });
  }
}
