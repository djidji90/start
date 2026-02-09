// src/audio/engine/StreamManager.js - VERSIÓN OPTIMIZADA
export class StreamManager {
  constructor() {
    this.baseURL = 'https://api.djidjimusic.com/api2';
    this.retryAttempts = 2;
    
    // CACHE INTELIGENTE
    this.chunkCache = new Map(); // songId -> Map(chunkIndex -> { blobUrl, timestamp })
    this.metadataCache = new Map(); // songId -> { duration, fileSize, bitrate }
    this.prefetchQueue = new Set();
    
    // CONTROL DE REQUESTS
    this.activeRequests = new Map(); // songId -> AbortController
    this.activeRanges = new Map(); // songId -> Set(rangeString)
    
    // CONFIGURACIÓN DE CHUNKS (igual que backend: 32KB)
    this.CHUNK_SIZE = 32 * 1024; // 32KB optimizado para redes africanas
    this.PREFETCH_CHUNKS = 5; // Precargar 5 chunks adelante
    this.MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB máximo en cache
    this.CACHE_TTL = 10 * 60 * 1000; // 10 minutos
    
    // MÉTRICAS
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      bytesStreamed: 0,
      partialRequests: 0,
      fullRequests: 0
    };
    
    this.startAutoCleanup();
  }

  /**
   * MÉTODO PRINCIPAL OPTIMIZADO - Con soporte para seek
   */
  async getAudio(songId, options = {}) {
    const {
      startTime = 0,      // Tiempo en segundos para seek
      forceFull = false,  // Forzar descarga completa
      priority = 'normal' // 'high', 'normal', 'low'
    } = options;

    // Validar ID
    const validatedId = this.validateSongId(songId);
    if (!validatedId) {
      throw new Error(`ID de canción inválido: ${songId}`);
    }

    // Cancelar requests anteriores para esta canción
    this.cancelRequest(validatedId);

    // Si forceFull es true o startTime es 0, descargar completo
    if (forceFull || startTime === 0) {
      this.metrics.fullRequests++;
      return await this.getFullAudio(validatedId, priority);
    }

    // Para seek: usar Range requests
    this.metrics.partialRequests++;
    return await this.getAudioFromTime(validatedId, startTime, priority);
  }

  /**
   * Obtener audio completo (para inicio de reproducción)
   */
  async getFullAudio(songId, priority = 'normal') {
    // Verificar si ya tenemos el archivo completo cacheado
    const fullCacheKey = `${songId}:full`;
    const cached = this.getFromChunkCache(songId, 'full');
    
    if (cached) {
      this.metrics.cacheHits++;
      console.log(`[StreamManager] Cache hit completo para ${songId}`);
      return cached;
    }

    this.metrics.cacheMisses++;
    console.log(`[StreamManager] Descargando completo: ${songId}`);
    
    const token = await this.getFreshToken();
    const controller = new AbortController();
    this.activeRequests.set(songId, controller);

    try {
      const url = `${this.baseURL}/songs/${songId}/stream/`;
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(url, {
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Cachear blob completo
      this.cacheChunk(songId, 'full', blobUrl);
      
      // Extraer y cachear metadata del blob completo
      await this.extractAndCacheMetadata(songId, blob);
      
      // Precargar chunks siguientes si es prioridad alta
      if (priority === 'high') {
        this.prefetchChunks(songId, 0);
      }

      return blobUrl;

    } catch (error) {
      console.error(`[StreamManager] Error descarga completa ${songId}:`, error);
      throw error;
    } finally {
      this.activeRequests.delete(songId);
    }
  }

  /**
   * Obtener audio desde tiempo específico (para seek)
   */
  async getAudioFromTime(songId, startTime, priority = 'normal') {
    console.log(`[StreamManager] Seek a ${startTime}s para ${songId}`);
    
    // Obtener metadata para calcular byte position
    const metadata = await this.getSongMetadata(songId);
    if (!metadata) {
      console.warn(`[StreamManager] Sin metadata, usando descarga completa`);
      return await this.getFullAudio(songId, priority);
    }

    const { duration, fileSize, bitrate } = metadata;
    
    // Calcular byte position
    const bytesPerSecond = bitrate ? (bitrate * 1000) / 8 : 16000; // Default 128kbps
    const startByte = Math.floor(startTime * bytesPerSecond);
    
    // Calcular chunk index
    const chunkIndex = Math.floor(startByte / this.CHUNK_SIZE);
    const chunkStart = chunkIndex * this.CHUNK_SIZE;
    
    console.log(`[StreamManager] Seek: ${startTime}s -> byte ${startByte}, chunk ${chunkIndex}`);
    
    // Obtener chunk específico y precargar siguientes
    const mainChunk = await this.getChunk(songId, chunkIndex, priority);
    
    if (priority === 'high') {
      // Precargar chunks siguientes para buffer
      this.prefetchChunks(songId, chunkIndex);
    }
    
    return mainChunk;
  }

  /**
   * Obtener chunk específico con cache
   */
  async getChunk(songId, chunkIndex, priority = 'normal') {
    const cacheKey = `${songId}:${chunkIndex}`;
    
    // Verificar cache primero
    const cached = this.getFromChunkCache(songId, chunkIndex);
    if (cached) {
      this.metrics.cacheHits++;
      console.log(`[StreamManager] Cache hit chunk ${chunkIndex} para ${songId}`);
      return cached;
    }

    this.metrics.cacheMisses++;
    
    // Si está en cola de prefetch, esperar
    if (this.prefetchQueue.has(cacheKey) && priority !== 'high') {
      console.log(`[StreamManager] Chunk ${chunkIndex} en prefetch, esperando...`);
      await this.waitForPrefetch(cacheKey, 2000); // Esperar máximo 2 segundos
      const waitedCache = this.getFromChunkCache(songId, chunkIndex);
      if (waitedCache) return waitedCache;
    }

    // Descargar chunk
    return await this.downloadChunk(songId, chunkIndex, priority);
  }

  /**
   * Descargar chunk específico desde servidor
   */
  async downloadChunk(songId, chunkIndex, priority = 'normal') {
    const chunkStart = chunkIndex * this.CHUNK_SIZE;
    const chunkEnd = chunkStart + this.CHUNK_SIZE - 1;
    const cacheKey = `${songId}:${chunkIndex}`;
    
    console.log(`[StreamManager] Descargando chunk ${chunkIndex} (bytes ${chunkStart}-${chunkEnd})`);
    
    const token = await this.getFreshToken();
    const controller = new AbortController();
    
    // Registrar request activo
    this.activeRequests.set(songId, controller);
    this.activeRanges.set(songId, new Set([`${chunkStart}-${chunkEnd}`]));
    
    try {
      const url = `${this.baseURL}/songs/${songId}/stream/`;
      const rangeHeader = `bytes=${chunkStart}-${chunkEnd}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Range': rangeHeader
        },
        signal: controller.signal
      });

      if (response.status === 206) { // Partial Content
        const contentRange = response.headers.get('Content-Range');
        console.log(`[StreamManager] Chunk ${chunkIndex} recibido: ${contentRange}`);
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Cachear chunk
        this.cacheChunk(songId, chunkIndex, blobUrl);
        
        // Actualizar métricas
        this.metrics.bytesStreamed += blob.size;
        
        return blobUrl;
      }
      
      // Si el servidor no soporta Range, descargar completo
      if (response.status === 200) {
        console.warn(`[StreamManager] Server no soporta Range, usando full download`);
        return await this.getFullAudio(songId, priority);
      }
      
      throw new Error(`Range request failed: ${response.status}`);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`[StreamManager] Download chunk ${chunkIndex} cancelado`);
        return null;
      }
      
      console.error(`[StreamManager] Error descargando chunk ${chunkIndex}:`, error);
      
      // Fallback: intentar con descarga completa
      if (chunkIndex === 0) { // Solo si es el primer chunk
        return await this.getFullAudio(songId, priority);
      }
      
      throw error;
      
    } finally {
      this.activeRequests.delete(songId);
      this.activeRanges.delete(songId);
      this.prefetchQueue.delete(cacheKey);
    }
  }

  /**
   * Precargar chunks para buffering
   */
  async prefetchChunks(songId, startChunkIndex) {
    const metadata = await this.getSongMetadata(songId);
    if (!metadata) return;
    
    const totalChunks = Math.ceil(metadata.fileSize / this.CHUNK_SIZE);
    
    // Precargar chunks siguientes
    for (let i = 1; i <= this.PREFETCH_CHUNKS; i++) {
      const chunkIndex = startChunkIndex + i;
      
      if (chunkIndex >= totalChunks) break;
      
      const cacheKey = `${songId}:${chunkIndex}`;
      
      // Si ya está cacheado o en proceso, saltar
      if (this.getFromChunkCache(songId, chunkIndex) || 
          this.prefetchQueue.has(cacheKey) ||
          this.activeRequests.has(songId)) {
        continue;
      }
      
      // Agregar a cola de prefetch
      this.prefetchQueue.add(cacheKey);
      
      // Descargar en background con baja prioridad
      setTimeout(() => {
        this.downloadChunk(songId, chunkIndex, 'low')
          .catch(error => {
            console.warn(`[StreamManager] Prefetch chunk ${chunkIndex} falló:`, error.message);
          });
      }, i * 100); // Delay escalonado
    }
  }

  /**
   * Obtener metadata de la canción
   */
  async getSongMetadata(songId) {
    // Verificar cache primero
    if (this.metadataCache.has(songId)) {
      return this.metadataCache.get(songId);
    }
    
    try {
      // Intentar obtener metadata del servidor
      const token = await this.getFreshToken();
      const response = await fetch(`${this.baseURL}/songs/${songId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const songData = await response.json();
        
        const metadata = {
          duration: songData.duration || 0,
          fileSize: songData.file_size || 0,
          bitrate: songData.bitrate || 128, // kbps
          title: songData.title,
          artist: songData.artist
        };
        
        this.metadataCache.set(songId, metadata);
        return metadata;
      }
    } catch (error) {
      console.warn(`[StreamManager] Error obteniendo metadata ${songId}:`, error.message);
    }
    
    // Metadata por defecto
    return {
      duration: 180, // 3 minutos por defecto
      fileSize: 5 * 1024 * 1024, // 5MB por defecto
      bitrate: 128, // 128kbps por defecto
      title: 'Unknown',
      artist: 'Unknown Artist'
    };
  }

  /**
   * Extraer metadata del blob y cachearla
   */
  async extractAndCacheMetadata(songId, blob) {
    try {
      // Crear audio temporal para extraer metadata
      const audio = new Audio();
      audio.preload = 'metadata';
      
      return new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          const metadata = {
            duration: audio.duration,
            fileSize: blob.size,
            bitrate: Math.round((blob.size * 8) / (audio.duration * 1000)), // kbps
            title: 'Unknown',
            artist: 'Unknown Artist'
          };
          
          this.metadataCache.set(songId, metadata);
          resolve(metadata);
        };
        
        audio.onerror = () => {
          console.warn(`[StreamManager] No se pudo extraer metadata de ${songId}`);
          resolve(null);
        };
        
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        
        // Limpiar después de 10 segundos
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      });
    } catch (error) {
      console.warn(`[StreamManager] Error extrayendo metadata:`, error);
      return null;
    }
  }

  /**
   * CACHE INTELIGENTE
   */
  getFromChunkCache(songId, chunkKey) {
    if (!this.chunkCache.has(songId)) return null;
    
    const songCache = this.chunkCache.get(songId);
    const cached = songCache.get(chunkKey);
    
    if (!cached) return null;
    
    // Verificar expiración
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.removeFromChunkCache(songId, chunkKey);
      return null;
    }
    
    return cached.blobUrl;
  }

  cacheChunk(songId, chunkKey, blobUrl) {
    if (!this.chunkCache.has(songId)) {
      this.chunkCache.set(songId, new Map());
    }
    
    const songCache = this.chunkCache.get(songId);
    songCache.set(chunkKey, {
      blobUrl,
      timestamp: Date.now(),
      size: this.estimateChunkSize(chunkKey)
    });
    
    // Limitar tamaño de cache
    this.enforceCacheLimits();
  }

  removeFromChunkCache(songId, chunkKey) {
    if (!this.chunkCache.has(songId)) return;
    
    const songCache = this.chunkCache.get(songId);
    const cached = songCache.get(chunkKey);
    
    if (cached) {
      try {
        URL.revokeObjectURL(cached.blobUrl);
      } catch (e) {
        console.warn(`Error revocando URL de cache:`, e);
      }
    }
    
    songCache.delete(chunkKey);
    
    // Si no hay más chunks, limpiar entrada completa
    if (songCache.size === 0) {
      this.chunkCache.delete(songId);
    }
  }

  enforceCacheLimits() {
    let totalSize = 0;
    const allEntries = [];
    
    // Calcular tamaño total
    for (const [songId, songCache] of this.chunkCache.entries()) {
      for (const [chunkKey, cached] of songCache.entries()) {
        totalSize += cached.size || this.CHUNK_SIZE;
        allEntries.push({ songId, chunkKey, timestamp: cached.timestamp });
      }
    }
    
    // Si excede límite, eliminar más antiguos
    if (totalSize > this.MAX_CACHE_SIZE) {
      // Ordenar por timestamp (más antiguos primero)
      allEntries.sort((a, b) => a.timestamp - b.timestamp);
      
      while (totalSize > this.MAX_CACHE_SIZE * 0.8 && allEntries.length > 0) {
        const oldest = allEntries.shift();
        this.removeFromChunkCache(oldest.songId, oldest.chunkKey);
        totalSize -= this.CHUNK_SIZE;
      }
    }
  }

  estimateChunkSize(chunkKey) {
    return chunkKey === 'full' ? 5 * 1024 * 1024 : this.CHUNK_SIZE; // Estimación
  }

  /**
   * MÉTODOS AUXILIARES (mantenidos de tu versión)
   */
  validateSongId(songId) {
    if (!songId) return null;
    const id = parseInt(songId);
    return isNaN(id) || id <= 0 ? null : id;
  }

  async getFreshToken() {
    let token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No hay token de autenticación');
    return token;
  }

  cancelRequest(songId) {
    if (this.activeRequests.has(songId)) {
      this.activeRequests.get(songId).abort();
      this.activeRequests.delete(songId);
    }
  }

  waitForPrefetch(cacheKey, timeout = 2000) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.prefetchQueue.has(cacheKey)) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 100);
      
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, timeout);
    });
  }

  startAutoCleanup() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 1000); // Cada minuto
  }

  cleanupExpiredCache() {
    const now = Date.now();
    
    for (const [songId, songCache] of this.chunkCache.entries()) {
      for (const [chunkKey, cached] of songCache.entries()) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.removeFromChunkCache(songId, chunkKey);
        }
      }
    }
    
    // Limpiar metadata cache
    for (const [songId, metadata] of this.metadataCache.entries()) {
      if (now - (metadata.timestamp || 0) > this.CACHE_TTL) {
        this.metadataCache.delete(songId);
      }
    }
  }

  /**
   * MÉTODOS PARA DEBUG Y MÉTRICAS
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.getCacheSize(),
      activeRequests: this.activeRequests.size,
      prefetchQueue: this.prefetchQueue.size
    };
  }

  getCacheSize() {
    let count = 0;
    for (const songCache of this.chunkCache.values()) {
      count += songCache.size;
    }
    return count;
  }

  clearCache() {
    for (const [songId, songCache] of this.chunkCache.entries()) {
      for (const [chunkKey, cached] of songCache.entries()) {
        try {
          URL.revokeObjectURL(cached.blobUrl);
        } catch (e) {
          // Ignorar errores
        }
      }
    }
    
    this.chunkCache.clear();
    this.metadataCache.clear();
    this.prefetchQueue.clear();
    
    console.log('[StreamManager] Cache limpiado completamente');
  }

  debug() {
    console.group('[StreamManager] Debug Info');
    console.log('Base URL:', this.baseURL);
    console.log('Chunk Size:', this.formatBytes(this.CHUNK_SIZE));
    console.log('Cache Size:', this.getCacheSize(), 'chunks');
    console.log('Active Requests:', this.activeRequests.size);
    console.log('Prefetch Queue:', this.prefetchQueue.size);
    console.log('Metrics:', this.getMetrics());
    
    // Detalle por canción
    for (const [songId, songCache] of this.chunkCache.entries()) {
      console.log(`  Song ${songId}: ${songCache.size} chunks`);
      const chunks = Array.from(songCache.keys()).sort();
      console.log(`    Chunks: ${chunks.join(', ')}`);
    }
    
    console.groupEnd();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Singleton export
export const streamManager = new StreamManager();