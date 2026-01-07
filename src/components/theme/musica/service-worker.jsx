// service-worker.js - Mejorado para streaming
const CACHE_NAME = 'djimusic-audio-v1';

// Archivos para cachear
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache first para recursos estáticos
  if (STATIC_CACHE_URLS.some(path => url.pathname.includes(path))) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
  
  // Para API calls, network first
  else if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cachear respuestas GET exitosas (opcional)
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
  
  // Para streaming de audio, network only
  else if (url.pathname.includes('/stream/') || url.pathname.includes('/download/')) {
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});