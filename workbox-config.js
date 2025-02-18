module.exports = {
  // Directorio base para la búsqueda de archivos
  globDirectory: 'build/',
  
  // Patrones de archivos a incluir en el precache
  globPatterns: [
    '**/*.{js,css,html,png,jpg,svg,json,woff2}'
  ],
  
  // Donde se generará el service worker final
  swDest: 'build/service-worker.js',
  
  // Service worker fuente que se modificará
  swSrc: 'src/service-worker.js',
  
  // Estrategias de caching
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        plugins: [
          {
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        ]
      }
    },
    {
      urlPattern: /^https:\/\/api\.tudominio\.com/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutos
        }
      }
    }
  ]
};