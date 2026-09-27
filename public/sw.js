// Offline support: pages network-first, assets cache-first. Bump CACHE to drop old caches on deploy.
const CACHE = 'kern-v2';
const SHELL = ['/', '/privacy/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The page sends the same-origin files it loaded on first visit, so they work offline too.
self.addEventListener('message', (e) => {
  const list = e.data && e.data.cache;
  if (!Array.isArray(list)) return;
  const urls = list.filter((u) => typeof u === 'string' && new URL(u).origin === self.location.origin);
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(urls)).catch(() => {}));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Keyed by path only: sign-in codes and dare links in the query never land in the cache.
    const key = new URL(req.url).pathname;
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); } return res; })
        .catch(() => caches.match(key).then((m) => m || caches.match('/'))),
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((m) => m || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
