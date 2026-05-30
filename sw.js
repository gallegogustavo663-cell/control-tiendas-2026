// sw.js — Service Worker · Control de Tiendas 2026
const CACHE = "tiendas-2026-v1";
const ASSETS = [
  "./index.html",
  "./manifiesto.json"
];

// Instalación: pre-cachear assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first, fallback a cache
self.addEventListener("fetch", e => {
  // Solo interceptar solicitudes same-origin o CDN conocidas
  const url = new URL(e.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname.includes("cdnjs.cloudflare.com") ||
                url.hostname.includes("gstatic.com") ||
                url.hostname.includes("googleapis.com");

  if (!isSameOrigin && !isCDN) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia fresca en cache
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
