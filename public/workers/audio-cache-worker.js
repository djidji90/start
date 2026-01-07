// public/workers/audio-cache-worker.js
const CACHE_NAME = 'audio-cache-v1';
const API_CACHE_NAME = 'api-cache-v1';
const STATIC_CACHE_NAME = 'static-cache-v1';

const AUDIO_CACHE_LIMIT = 50 * 1024 * 1024; // 50MB
const API_CACHE_LIMIT = 10 * 1024 * 1024; // 10MB

// URLs para cachear
const AUDIO_URLS = [
  '/api2/songs/',
  '/api2/songs/*/stream/'
];

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

// Activación
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar caches viejos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![AUDIO_CACHE_NAME, API_CACHE_NAME, STATIC_CACHE_NAME].includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Estrategia de cache para audio
const audioCacheStrategy = async (request) => {
  try {
    // Primero intentar desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Verificar si es fresco (menos de 1 hora)
      const cachedTime = new Date(cachedResponse.headers.get('date')).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (Date.now() - cachedTime < oneHour) {
        return cachedResponse;
      }
    }
    
    // Si no está en cache o está viejo, ir a la red
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      
      // Verificar límite de cache
      const keys = await cache.keys();
      let totalSize = 0;
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      
      // Si supera el límite, limpiar el 20% más viejo
      if (totalSize + networkResponse.headers.get('content-length') > AUDIO_CACHE_LIMIT) {
        await cleanupOldCache(cache, 0.2);
      }
      
      // Clonar respuesta para cachear
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
      
      // Notificar al cliente
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'AUDIO_CACHED',
            url: request.url,
            size: networkResponse.headers.get('content-length')
          });
        });
      });
    }
    
    return networkResponse;
    
  } catch (error) {
    // Fallback a cache si hay error de red
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
};

// Limpiar cache viejo
async function cleanupOldCache(cache, percentage = 0.2) {
  const requests = await cache.keys();
  const items = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      items.push({
        request,
        size: blob.size,
        date: new Date(response.headers.get('date') || Date.now())
      });
    }
  }
  
  // Ordenar por fecha (más viejo primero)
  items.sort((a, b) => a.date - b.date);
  
  // Calcular cuántos eliminar
  const toDelete = Math.ceil(items.length * percentage);
  
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(items[i].request);
  }
}

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Estrategia para audio
  if (url.pathname.includes('/api2/songs/') && url.pathname.includes('/stream/')) {
    event.respondWith(audioCacheStrategy(event.request));
    return;
  }
  
  // Estrategia para API
  if (url.pathname.startsWith('/api2/')) {
    event.respondWith(apiCacheStrategy(event.request));
    return;
  }
  
  // Estrategia para assets estáticos
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(staticCacheStrategy(event.request));
    return;
  }
});

// Estrategia para API
async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear respuesta
      const clone = networkResponse.clone();
      cache.put(request, clone);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estrategia para static assets
async function staticCacheStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // Si no hay conexión y no está en cache, mostrar offline page
    return caches.match('/offline.html');
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0].postMessage(info);
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(AUDIO_CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Obtener información del cache
async function getCacheInfo() {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const requests = await cache.keys();
  
  let totalSize = 0;
  const items = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
      
      items.push({
        url: request.url,
        size: blob.size,
        type: blob.type,
        date: response.headers.get('date')
      });
    }
  }
  
  return {
    totalSize,
    itemCount: items.length,
    items
  };
}