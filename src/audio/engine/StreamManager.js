// src/audio/engine/StreamManager.js - VERSIÓN CORREGIDA CON MEDIASOURCE
export class StreamManager {
  constructor() {
    this.baseURL = 'https://api.djidjimusic.com/api2';
    this.retryAttempts = 2;
    
    // CACHE INTELIGENTE
    this.chunkCache = new Map();
    this.metadataCache = new Map();
    
    // CONTROL DE REQUESTS
    this.activeRequests = new Map();
    
    // MEDIASOURCE STREAMING
    this.mediaSources = new Map();      // songId -> MediaSource
    this.sourceBuffers = new Map();     // songId -> SourceBuffer
    this.chunkQueues = new Map();       // songId -> Array de chunks pendientes
    this.streamUrls = new Map();        // songId -> URL.createObjectURL
    this.activeStreams = new Map();     // songId -> { url, audioElement }
    
    // CONFIGURACIÓN
    this.CHUNK_SIZE = 32 * 1024;        // 32KB - IGUAL QUE BACKEND
    this.PREFETCH_CHUNKS = 10;          // Precargar 10 chunks
    this.MAX_CACHE_SIZE = 50 * 1024 * 1024;
    this.CACHE_TTL = 10 * 60 * 1000;
    
    // MÉTRICAS
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      bytesStreamed: 0,
      partialRequests: 0,
      fullRequests: 0,
      mediaSourcesCreated: 0
    };
    
    this.startAutoCleanup();
  }

  /**
   * MÉTODO PRINCIPAL - AHORA CON STREAMING REAL
   */
  async getAudio(songId, options = {}) {
    const {
      startTime = 0,
      forceFull = false,
      priority = 'normal',
      audioElement = null  // Opcional: elemento audio existente
    } = options;

    const validatedId = this.validateSongId(songId);
    if (!validatedId) throw new Error(`ID inválido: ${songId}`);

    this.cancelRequest(validatedId);

    // Si es el inicio o no soporta MediaSource, usar descarga completa
    if (forceFull || startTime === 0 || !window.MediaSource) {
      this.metrics.fullRequests++;
      return await this.getFullAudio(validatedId, priority);
    }

    // STREAMING CON MEDIASOURCE
    this.metrics.partialRequests++;
    return await this.createMediaSourceStream(validatedId, startTime, audioElement);
  }

  /**
   * CREAR STREAM CON MEDIASOURCE - ¡ESTA ES LA SOLUCIÓN!
   */
  async createMediaSourceStream(songId, startTime, existingAudioElement = null) {
    console.log(`[StreamManager] 🎵 Creando stream para ${songId} desde ${startTime}s`);
    
    // Limpiar stream anterior si existe
    this.cleanupMediaSource(songId);
    
    // Obtener metadata
    const metadata = await this.getSongMetadata(songId);
    if (!metadata) {
      console.warn(`[StreamManager] Sin metadata, usando descarga completa`);
      return await this.getFullAudio(songId);
    }

    // 1. Crear MediaSource
    const mediaSource = new MediaSource();
    this.mediaSources.set(songId, mediaSource);
    this.metrics.mediaSourcesCreated++;
    
    // 2. Crear URL
    const url = URL.createObjectURL(mediaSource);
    this.streamUrls.set(songId, url);
    
    // 3. Obtener o crear elemento audio
    let audio = existingAudioElement;
    if (!audio) {
      audio = new Audio();
    }
    
    this.activeStreams.set(songId, {
      url,
      audioElement: audio,
      startTime,
      metadata
    });

    // 4. Configurar evento sourceopen
    mediaSource.addEventListener('sourceopen', async () => {
      try {
        // Determinar MIME type
        let mimeType = 'audio/mpeg';
        if (MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"')) {
          mimeType = 'audio/mp4; codecs="mp4a.40.2"';
        }
        
        // Añadir SourceBuffer
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBuffer.mode = 'sequence'; // ¡IMPORTANTE!
        this.sourceBuffers.set(songId, sourceBuffer);
        
        // Inicializar cola de chunks
        this.chunkQueues.set(songId, []);
        
        // Configurar evento updateend para procesar cola
        sourceBuffer.addEventListener('updateend', () => {
          this.processChunkQueue(songId);
        });
        
        // Calcular chunk inicial basado en startTime
        const bytesPerSecond = (metadata.bitrate || 128) * 1000 / 8;
        const startByte = Math.floor(startTime * bytesPerSecond);
        const startChunk = Math.floor(startByte / this.CHUNK_SIZE);
        
        console.log(`[StreamManager] Iniciando streaming desde chunk ${startChunk}`);
        
        // Cargar chunks secuencialmente
        await this.loadChunksSequentially(songId, startChunk, sourceBuffer);
        
      } catch (error) {
        console.error(`[StreamManager] Error en sourceopen:`, error);
      }
    });

    // Configurar el audio con la URL
    audio.src = url;
    
    // Auto-play si no se proporcionó elemento existente
    if (!existingAudioElement) {
      audio.play().catch(e => console.warn('[StreamManager] Auto-play bloqueado:', e));
    }
    
    return url;
  }

  /**
   * CARGAR CHUNKS SECUENCIALMENTE
   */
  async loadChunksSequentially(songId, startChunk, sourceBuffer) {
    const metadata = await this.getSongMetadata(songId);
    const totalChunks = Math.ceil((metadata.fileSize || 5 * 1024 * 1024) / this.CHUNK_SIZE);
    
    console.log(`[StreamManager] Cargando chunks ${startChunk} - ${totalChunks - 1}`);
    
    for (let i = startChunk; i < totalChunks; i++) {
      // Verificar si el stream sigue activo
      if (!this.mediaSources.has(songId)) break;
      
      try {
        // Obtener chunk (cache o descarga)
        const chunkUrl = await this.getChunk(songId, i, 'high');
        
        if (chunkUrl) {
          // Convertir a ArrayBuffer
          const response = await fetch(chunkUrl);
          const arrayBuffer = await response.arrayBuffer();
          
          // Agregar a cola
          const queue = this.chunkQueues.get(songId) || [];
          queue.push({
            data: arrayBuffer,
            index: i,
            timestamp: Date.now()
          });
          this.chunkQueues.set(songId, queue);
          
          // Procesar cola
          this.processChunkQueue(songId);
        }
        
        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`[StreamManager] Error cargando chunk ${i}:`, error);
        break;
      }
    }
    
    // Marcar fin de stream cuando todos los chunks están cargados
    setTimeout(() => {
      const mediaSource = this.mediaSources.get(songId);
      const queue = this.chunkQueues.get(songId);
      if (mediaSource && mediaSource.readyState === 'open' && (!queue || queue.length === 0)) {
        try {
          mediaSource.endOfStream();
          console.log(`[StreamManager] Stream completado para ${songId}`);
        } catch (e) {
          // Ignorar si ya terminó
        }
      }
    }, 1000);
  }

  /**
   * PROCESAR COLA DE CHUNKS
   */
  processChunkQueue(songId) {
    const sourceBuffer = this.sourceBuffers.get(songId);
    const queue = this.chunkQueues.get(songId);
    
    if (!sourceBuffer || !queue || sourceBuffer.updating || queue.length === 0) {
      return;
    }
    
    // Ordenar chunks por índice
    queue.sort((a, b) => a.index - b.index);
    
    // Procesar el siguiente chunk
    const nextChunk = queue[0];
    
    try {
      sourceBuffer.appendBuffer(nextChunk.data);
      console.log(`[StreamManager] ✅ Chunk ${nextChunk.index} agregado al buffer`);
      
      // Remover de la cola
      queue.shift();
      this.chunkQueues.set(songId, queue);
      
    } catch (error) {
      console.error(`[StreamManager] Error appendBuffer:`, error);
      
      // Si es error de QuotaExceeded, limpiar buffer viejo
      if (error.name === 'QuotaExceededError') {
        this.cleanupSourceBuffer(songId, sourceBuffer);
      }
    }
  }

  /**
   * LIMPIAR BUFFER VIEJO
   */
  cleanupSourceBuffer(songId, sourceBuffer) {
    try {
      if (sourceBuffer.buffered.length > 0) {
        const start = sourceBuffer.buffered.start(0);
        const end = Math.min(start + 30, sourceBuffer.buffered.end(0)); // Mantener últimos 30 segundos
        sourceBuffer.remove(start, end);
        console.log(`[StreamManager] 🧹 Buffer limpiado: ${start}-${end}`);
      }
    } catch (e) {
      console.warn('[StreamManager] Error limpiando buffer:', e);
    }
  }

  /**
   * LIMPIAR RECURSOS DE STREAMING
   */
  cleanupMediaSource(songId) {
    // Limpiar SourceBuffer
    const sourceBuffer = this.sourceBuffers.get(songId);
    if (sourceBuffer) {
      try {
        if (!sourceBuffer.updating) {
          sourceBuffer.abort();
        }
      } catch (e) {}
      this.sourceBuffers.delete(songId);
    }

    // Limpiar MediaSource
    const mediaSource = this.mediaSources.get(songId);
    if (mediaSource && mediaSource.readyState !== 'closed') {
      try {
        if (mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      } catch (e) {}
      this.mediaSources.delete(songId);
    }

    // Limpiar URL
    const url = this.streamUrls.get(songId);
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
      this.streamUrls.delete(songId);
    }

    // Limpiar cola
    this.chunkQueues.delete(songId);
    this.activeStreams.delete(songId);
  }

  /**
   * Obtener chunk (con cache) - SIN CAMBIOS
   */
  async getChunk(songId, chunkIndex, priority = 'normal') {
    // Verificar cache
    const cached = this.getFromChunkCache(songId, chunkIndex);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    this.metrics.cacheMisses++;
    return await this.downloadChunk(songId, chunkIndex, priority);
  }

  /**
   * Descargar chunk - CORREGIDO (status 206 funciona)
   */
  async downloadChunk(songId, chunkIndex, priority = 'normal') {
    const chunkStart = chunkIndex * this.CHUNK_SIZE;
    const chunkEnd = chunkStart + this.CHUNK_SIZE - 1;
    
    console.log(`[StreamManager] ⬇️ Descargando chunk ${chunkIndex} (${chunkStart}-${chunkEnd})`);
    
    const token = await this.getFreshToken();
    const controller = new AbortController();
    this.activeRequests.set(songId, controller);
    
    try {
      const url = `${this.baseURL}/songs/${songId}/stream/`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Range': `bytes=${chunkStart}-${chunkEnd}`
        },
        signal: controller.signal
      });

      // ✅ TU BACKEND DEVUELVE 206 - ¡FUNCIONA!
      if (response.status === 206) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        this.cacheChunk(songId, chunkIndex, blobUrl);
        this.metrics.bytesStreamed += blob.size;
        
        return blobUrl;
      }
      
      // Fallback
      if (response.status === 200) {
        console.warn(`[StreamManager] Servidor devolvió 200, usando full`);
        return await this.getFullAudio(songId);
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error) {
      if (error.name === 'AbortError') return null;
      throw error;
    } finally {
      this.activeRequests.delete(songId);
    }
  }

  /**
   * Obtener audio completo (fallback) - SIN CAMBIOS
   */
  async getFullAudio(songId, priority = 'normal') {
    const cached = this.getFromChunkCache(songId, 'full');
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    this.metrics.cacheMisses++;
    console.log(`[StreamManager] Descargando completo: ${songId}`);
    
    const token = await this.getFreshToken();
    const controller = new AbortController();
    this.activeRequests.set(songId, controller);

    try {
      const response = await fetch(`${this.baseURL}/songs/${songId}/stream/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      this.cacheChunk(songId, 'full', blobUrl);
      await this.extractAndCacheMetadata(songId, blob);
      
      return blobUrl;
      
    } finally {
      this.activeRequests.delete(songId);
    }
  }

  /**
   * Obtener metadata - SIN CAMBIOS
   */
  async getSongMetadata(songId) {
    if (this.metadataCache.has(songId)) {
      return this.metadataCache.get(songId);
    }
    
    try {
      const token = await this.getFreshToken();
      const response = await fetch(`${this.baseURL}/songs/${songId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const metadata = {
          duration: data.duration || 0,
          fileSize: data.file_size || 0,
          bitrate: data.bitrate || 128,
          title: data.title,
          artist: data.artist,
          timestamp: Date.now()
        };
        this.metadataCache.set(songId, metadata);
        return metadata;
      }
    } catch (error) {
      console.warn(`[StreamManager] Error metadata:`, error.message);
    }
    
    return {
      duration: 180,
      fileSize: 5 * 1024 * 1024,
      bitrate: 128,
      title: 'Unknown',
      artist: 'Unknown',
      timestamp: Date.now()
    };
  }

  /**
   * MÉTODOS DE CACHE - SIN CAMBIOS
   */
  getFromChunkCache(songId, chunkKey) {
    if (!this.chunkCache.has(songId)) return null;
    const songCache = this.chunkCache.get(songId);
    const cached = songCache.get(chunkKey);
    
    if (!cached) return null;
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
      size: this.CHUNK_SIZE
    });
    this.enforceCacheLimits();
  }

  removeFromChunkCache(songId, chunkKey) {
    if (!this.chunkCache.has(songId)) return;
    const songCache = this.chunkCache.get(songId);
    const cached = songCache.get(chunkKey);
    
    if (cached) {
      try { URL.revokeObjectURL(cached.blobUrl); } catch (e) {}
    }
    
    songCache.delete(chunkKey);
    if (songCache.size === 0) {
      this.chunkCache.delete(songId);
    }
  }

  enforceCacheLimits() {
    let totalSize = 0;
    const allEntries = [];
    
    for (const [songId, songCache] of this.chunkCache.entries()) {
      for (const [chunkKey, cached] of songCache.entries()) {
        totalSize += cached.size || this.CHUNK_SIZE;
        allEntries.push({ songId, chunkKey, timestamp: cached.timestamp });
      }
    }
    
    if (totalSize > this.MAX_CACHE_SIZE) {
      allEntries.sort((a, b) => a.timestamp - b.timestamp);
      while (totalSize > this.MAX_CACHE_SIZE * 0.8 && allEntries.length > 0) {
        const oldest = allEntries.shift();
        this.removeFromChunkCache(oldest.songId, oldest.chunkKey);
        totalSize -= this.CHUNK_SIZE;
      }
    }
  }

  /**
   * MÉTODOS AUXILIARES
   */
  validateSongId(songId) {
    if (!songId) return null;
    const id = parseInt(songId);
    return isNaN(id) || id <= 0 ? null : id;
  }

  async getFreshToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No hay token');
    return token;
  }

  cancelRequest(songId) {
    if (this.activeRequests.has(songId)) {
      this.activeRequests.get(songId).abort();
      this.activeRequests.delete(songId);
    }
  }

  async extractAndCacheMetadata(songId, blob) {
    try {
      const audio = new Audio();
      audio.preload = 'metadata';
      
      return new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          const metadata = {
            duration: audio.duration,
            fileSize: blob.size,
            bitrate: Math.round((blob.size * 8) / (audio.duration * 1000)),
            title: 'Unknown',
            artist: 'Unknown',
            timestamp: Date.now()
          };
          this.metadataCache.set(songId, metadata);
          resolve(metadata);
        };
        
        audio.onerror = () => resolve(null);
        
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      });
    } catch (error) {
      return null;
    }
  }

  startAutoCleanup() {
    setInterval(() => this.cleanupExpiredCache(), 60000);
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
  }

  /**
   * DEBUG
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.getCacheSize(),
      activeRequests: this.activeRequests.size,
      activeStreams: this.activeStreams.size,
      mediaSources: this.mediaSources.size
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
        try { URL.revokeObjectURL(cached.blobUrl); } catch (e) {}
      }
    }
    this.chunkCache.clear();
    this.metadataCache.clear();
    console.log('[StreamManager] Cache limpiado');
  }

  debug() {
    console.group('[StreamManager] DEBUG');
    console.log('Chunk Size:', this.formatBytes(this.CHUNK_SIZE));
    console.log('Cache Size:', this.getCacheSize(), 'chunks');
    console.log('Active Streams:', this.activeStreams.size);
    console.log('MediaSources:', this.mediaSources.size);
    console.log('Metrics:', this.getMetrics());
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

export const streamManager = new StreamManager();