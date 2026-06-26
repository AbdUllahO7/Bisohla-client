const CACHE_NAME = 'bishola-pwa-cache-v1';
const STATIC_ASSETS = [
  '/',
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

  // Bypass API requests and non-GET requests to prevent caching issues
  if (req.method !== 'GET' || url.pathname.startsWith('/api') || url.pathname.includes('/listing-favorites')) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch static assets in background to keep them updated
        if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/assets')) {
          fetch(req).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          }).catch(() => { /* ignore offline errors */ });
        }
        return cachedResponse;
      }

      return fetch(req)
        .then((networkResponse) => {
          // Cache successful responses of next.js assets and normal images
          if (
            networkResponse.status === 200 &&
            (url.pathname.startsWith('/_next') ||
             url.pathname.startsWith('/assets') ||
             url.pathname.endsWith('.js') ||
             url.pathname.endsWith('.css') ||
             url.pathname.endsWith('.png') ||
             url.pathname.endsWith('.jpg') ||
             url.pathname.endsWith('.jpeg'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
