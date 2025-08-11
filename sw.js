const CACHE = 'fbr-v4';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  // icons & logo
  './icons/icon-16x16.png',
  './icons/icon-32x32.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './header-logo.png',
  // css (CDN is fine to cache too)
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
];

// Runtime: cache-first for same-origin images under /images
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Simple SPA-style routing + runtime image cache
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // Cache-first for same-origin images
  if (url.origin === location.origin && url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(req).then(hit =>
        hit || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for everything else, with offline fallback
  event.respondWith(
    fetch(req).then(res => {
      // Optionally cache successful GETs
      if (res.ok && req.url.startsWith(location.origin)) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      // If navigation request fails, serve shell
      (req.mode === 'navigate'
        ? caches.match('./index.html')
        : caches.match(req))
    )
  );
});
