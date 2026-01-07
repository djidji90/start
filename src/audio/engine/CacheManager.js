// src/audio/engine/CacheManager.js

/**
 * CacheManager - Maneja cache offline para PWA
 * Usa Cache API + IndexedDB para almacenamiento persistente
 */
export class CacheManager {
  constructor() {
    this.cacheName = 'dji-music-v1';
    this.supported = 'caches' in window && 'indexedDB' in window;
    
    if (!this.supported) {
      console.warn('[CacheManager] Cache API no soportada en este navegador');
    }
  }

  /**
   * Cachear canción para offline
   */
  async cacheSong(songId, blob) {
    if (!this.supported) return false;

    try {
      // 1. Cache API para respuestas HTTP
      const cache = await caches.open(this.cacheName);
      const url = `https://api.djidjimusic.com/api2/songs/${songId}/stream/`;
      
      const response = new Response(blob, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': blob.size.toString(),
        }
      });

      await cache.put(url, response);
      console.log(`[CacheManager] Canción ${songId} cacheada (${this.formatBytes(blob.size)})`);

      // 2. IndexedDB para metadata y búsqueda rápida
      await this._storeInIndexedDB(songId, {
        cachedAt: Date.now(),
        size: blob.size,
        url: url
      });

      return true;
    } catch (error) {
      console.error('[CacheManager] Error cacheando canción:', error);
      return false;
    }
  }

  /**
   * Obtener canción cacheada
   */
  async getCachedSong(songId) {
    if (!this.supported) return null;

    try {
      // Primero intentar Cache API
      const cache = await caches.open(this.cacheName);
      const url = `https://api.djidjimusic.com/api2/songs/${songId}/stream/`;
      
      const response = await cache.match(url);
      
      if (response) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        console.log(`[CacheManager] Canción ${songId} obtenida de cache`);
        return blobUrl;
      }
      
      return null;
    } catch (error) {
      console.error('[CacheManager] Error obteniendo canción cacheada:', error);
      return null;
    }
  }

  /**
   * Verificar si canción está cacheada
   */
  async isSongCached(songId) {
    if (!this.supported) return false;

    try {
      const cache = await caches.open(this.cacheName);
      const url = `https://api.djidjimusic.com/api2/songs/${songId}/stream/`;
      const response = await cache.match(url);
      
      return !!response;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener espacio usado en cache
   */
  async getCacheUsage() {
    if (!this.supported) return { used: 0, total: 0 };

    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      return {
        used: totalSize,
        items: keys.length,
        readable: this.formatBytes(totalSize)
      };
    } catch (error) {
      console.error('[CacheManager] Error obteniendo uso de cache:', error);
      return { used: 0, total: 0 };
    }
  }

  /**
   * Limpiar cache
   */
  async clearCache() {
    if (!this.supported) return false;

    try {
      const deleted = await caches.delete(this.cacheName);
      console.log('[CacheManager] Cache limpiada');
      return deleted;
    } catch (error) {
      console.error('[CacheManager] Error limpiando cache:', error);
      return false;
    }
  }

  /**
   * Almacenar en IndexedDB (metadata adicional)
   */
  async _storeInIndexedDB(songId, metadata) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DjiMusicCache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('songs')) {
          db.createObjectStore('songs', { keyPath: 'songId' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['songs'], 'readwrite');
        const store = transaction.objectStore('songs');
        
        const putRequest = store.put({ songId, ...metadata });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  /**
   * Formatear bytes para logs
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton export
export const cacheManager = new CacheManager();