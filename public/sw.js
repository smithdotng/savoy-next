// Minimal service worker: just enough offline support + caching to satisfy
// PWA installability, without trying to cache admin/API traffic.
const CACHE_NAME = 'savoy-menu-v2';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/images/logo-header.png',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept API calls, admin routes, or non-GET requests -
  // those always need a live network round-trip.
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('/menu') ||
    request.url.includes('/login')
  ) {
    return;
  }

  // Navigation requests: try the network first, fall back to cache, then
  // to the cached homepage if fully offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
