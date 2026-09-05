/* ==========================================================================
   MilkGuard Progressive Web App (PWA) Service Worker
   - Provides safe static asset caching & offline app shell
   - STRICTLY BYPASSES Supabase auth, OAuth callbacks, AI APIs, & live data
   - Does NOT cache private scan history or hardware Bluetooth operations
   ========================================================================== */

const CACHE_NAME = 'milkguard-pwa-v2';

// Critical core assets cached on install for offline shell
const PRECACHE_ASSETS = [
  '/offline',
  '/manifest.json',
  '/brand/logo.png',
  '/brand/logo-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// 1. INSTALL EVENT — pre-cache core offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SW] Pre-cache failed for some assets:', err);
      }
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE EVENT — purge obsolete caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if a URL must NEVER be cached (strictly dynamic/auth/sensitive)
function isBypassUrl(url) {
  const pathname = url.pathname;
  const href = url.href;

  // 1. Supabase API & Auth endpoints
  if (url.hostname.includes('supabase.co')) return true;

  // 2. Application API routes (AI analysis, Groq, blockchain, etc.)
  if (pathname.startsWith('/api/')) return true;

  // 3. Authentication & OAuth callback routes
  if (pathname.startsWith('/auth/')) return true;

  // 4. OAuth query strings (code, token, error, state)
  if (
    url.searchParams.has('code') ||
    url.searchParams.has('error') ||
    url.searchParams.has('access_token') ||
    url.searchParams.has('refresh_token') ||
    url.searchParams.has('token')
  ) {
    return true;
  }

  // 5. Dynamic authenticated user data routes (Scan, History, Reports, Profile)
  if (
    pathname.startsWith('/scan') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/profile')
  ) {
    return true;
  }

  return false;
}

// 3. FETCH EVENT — intelligent, security-first interception
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle standard HTTP/HTTPS GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore non-http/https schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // SENSITIVE / AUTH / API BYPASS: Always go straight to network
  if (isBypassUrl(url)) {
    return; // SW passes through directly to network
  }

  // A. NAVIGATION REQUESTS (HTML page loads)
  // Network-First: Fetch freshest page; fallback to offline page if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const offlineResponse = await cache.match('/offline');
          return offlineResponse || new Response(
            'Offline. Please reconnect to use MilkGuard.',
            {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // B. STATIC ASSETS (Next.js static files, images, icons, fonts)
  // Cache-first with network fallback
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network fetch
  event.respondWith(fetch(request));
});

// Support manual skip-waiting trigger from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
