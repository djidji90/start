// public/sw.js

const CACHE_NAME = 'djidjimusic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/offline.html'
];

// ============================================
// 🔄 INSTALL
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔄 Instalando Service Worker...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cacheando assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('❌ Error cacheando:', error);
      })
  );
});

// ============================================
// ⚡ ACTIVATE
// ============================================
self.addEventListener('activate', (event) => {
  console.log('⚡ Activando Service Worker...');

  event.waitUntil(
    Promise.all([
      self.clients.claim(),

      caches.keys().then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🧹 Eliminando cache viejo:', key);
              return caches.delete(key);
            })
        );
      })
    ])
  );
});

// ============================================
// 🌐 FETCH (ESTRATEGIA PRO)
// ============================================
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  // 🎯 1. API → Network First
  if (request.url.includes('/api2/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });

          return response;
        })
        .catch(() => {
          console.log('📦 API fallback desde cache:', request.url);
          return caches.match(request);
        })
    );
    return;
  }

  // 🎯 2. Assets → Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        console.log('📦 Cache hit:', request.url);
        return cached;
      }

      return fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            });
          }

          return response;
        })
        .catch(() => {
          console.log('❌ Offline fallback:', request.url);

          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// ============================================
// 🧠 MENSAJES
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});