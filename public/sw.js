// ============================================================
// Service Worker — BlackBelt PWA
// ============================================================
// Strategy:
//   Static assets → Cache-first (fast loads)
//   API calls     → Network-first (fresh data)
//   Pages         → Network-first + offline fallback
//
// Setup: Registered in app/layout.tsx via <script>
// ============================================================

const CACHE_NAME = 'blackbelt-v1';
const STATIC_CACHE = 'blackbelt-static-v1';
const RUNTIME_CACHE = 'blackbelt-runtime-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/blackbelt-lion-logo.png',
  '/blackbelt-badge.png',
];

// ── Install: Pre-cache shell ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: Clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Strategy router ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser-extension and chrome-extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return;

  // API calls: Network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Static assets (images, fonts, CSS, JS): Cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Pages: Network-first with offline fallback
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Everything else: Network-first
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ── Strategies ──

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback page
    const fallback = await caches.match('/offline');
    if (fallback) return fallback;

    return new Response(
      '<html><body style="background:#0A0908;color:#FFF;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif"><div style="text-align:center"><h1>Sem conexão</h1><p>Conecte-se à internet para acessar o BlackBelt</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html' }, status: 503 }
    );
  }
}
