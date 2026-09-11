const CACHE_NAME = 'bishola-pwa-cache-v2';
const STATIC_ASSETS = [
  '/favicon.ico',
  '/assets/icons/apple-icon.png',
  '/assets/icons/001-car.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Never intercept navigation requests - let Next.js middleware and locale redirects execute naturally
  if (req.mode === 'navigate') {
    return;
  }

  // 2. Bypass API requests, non-GET requests, and auth/action endpoints
  if (
    req.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/listing-favorites') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1'
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch static assets in background to keep them updated
        if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/assets')) {
          fetch(req).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          }).catch(() => { /* ignore offline errors */ });
        }
        return cachedResponse;
      }

      return fetch(req)
        .then((networkResponse) => {
          // Only cache successful, non-redirected static assets
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            !networkResponse.redirected &&
            (url.pathname.startsWith('/_next/static') ||
             url.pathname.startsWith('/assets') ||
             url.pathname.endsWith('.png') ||
             url.pathname.endsWith('.jpg') ||
             url.pathname.endsWith('.jpeg') ||
             url.pathname.endsWith('.svg') ||
             url.pathname.endsWith('.webp'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
