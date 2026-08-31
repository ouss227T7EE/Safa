// Safa (صفا) Cognitive Restoration Platform - Offline PWA Service Worker
const CACHE_NAME = 'safa-offline-v2.4.0';

// Core static assets list including explicit names requested for offline persistence
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/style.css',
  '/app.js',
  '/engine.js',
  '/games.js',
  '/chess.js',
  '/games-ui.js',
  '/i18n.js'
];

// Install Event: Pre-cache core offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Safa SW] Pre-caching static assets for offline execution...');
      // Use individual caching to avoid a single 404 failing the entire pre-cache
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          // In Vite dev/build setups, virtual modules or non-root paths are resolved on-demand
          console.debug('[Safa SW] Pre-cache entry note for:', asset, err?.message || err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale caches and claim immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Safa SW] Clearing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First with Network Fallback & Runtime Dynamic Caching
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http(s) or cross-origin API calls that don't support caching
  if (!url.protocol.startsWith('http')) return;

  // Handle SPA Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html') || await caches.match('/');
          return fallback || new Response('Offline - Safa Platform', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Cache-First strategy for static assets (scripts, styles, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately, but refresh cache in background (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
          })
          .catch(() => {
            /* Network offline - cached response was already served */
          });
        return cachedResponse;
      }

      // Fetch from network and dynamically cache valid responses
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting an image/icon, fallback to default icon
          if (event.request.destination === 'image') {
            return caches.match('/icon.svg');
          }
          return new Response('Resource unavailable offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
