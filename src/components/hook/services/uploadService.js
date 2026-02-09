// services/uploadService.js
// VERSIÓN PRODUCTION READY - SISTEMA DE UPLOAD DJI MUSIC
// TOTALMENTE COMPATIBLE CON BACKEND DJANGO DJI MUSIC

class UploadService {
  constructor() {
    // CONFIGURACIÓN PRODUCTION
    this.config = {
      baseURL: this.getApiBaseURL(),
      endpoints: {
        request: '/api2/upload/direct/request/',
        confirm: '/api2/upload/direct/confirm/:id/',
        status: '/api2/upload/direct/status/:id/',
        cancel: '/api2/upload/direct/cancel/:id/',
        quota: '/api2/upload/quota/',
        admin: {
          dashboard: '/api2/upload/admin/dashboard/',
          stats: '/api2/upload/admin/stats/',
          cleanup: '/api2/upload/admin/cleanup/',
          orphaned: '/api2/upload/admin/check-orphaned/',
        },
      },
      
      // LÍMITES PRODUCTION
      limits: {
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxDailyUploads: 50,
        allowedTypes: [
          'audio/mpeg',  'audio/mp3',    // MP3
          'audio/wav',   'audio/x-wav',  // WAV
          'audio/ogg',   'application/ogg', // OGG
          'audio/mp4',   'audio/m4a',    // M4A/AAC
          'audio/x-m4a', 'audio/aac',
          'audio/flac',  'audio/x-flac', // FLAC
          'audio/webm',                  // WEBM
          'audio/opus',                  // OPUS
          'audio/x-aiff', 'audio/aiff',  // AIFF
        ],
        allowedExtensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm', '.opus', '.aiff'],
        maxConcurrent: 3,
        maxRetries: 3,
      },
      
      // TIMEOUTS PRODUCTION
      timeouts: {
        request: 15000,    // 15s para solicitar URL
        upload: 300000,    // 5min para subir archivo
        status: 10000,     // 10s para verificar estado
        confirmation: 30000, // 30s para confirmar
        processing: 180000,  // 3min para esperar procesamiento
      },
      
      // RETRY CONFIG
      retry: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        rateLimitDelay: 30000,
      },
      
      // CACHE CONFIG
      cache: {
        quotaTTL: 300000,      // 5 minutos
        statusTTL: 30000,      // 30 segundos
        completedTTL: 86400000, // 24 horas
        maxCompleted: 100,     // Máximo 100 uploads en cache
      },
    };
    
    // ESTADO INTERNO - OPTIMIZADO PARA PRODUCTION
    this.state = {
      activeUploads: new Map(),      // uploadId -> { controller, metadata, etc }
      completedUploads: new Map(),   // uploadId -> { result, timestamp }
      pendingQueue: [],              // Cola para rate limiting
      isProcessingQueue: false,
      serviceAvailable: true,
      lastAvailabilityCheck: 0,
      dailyUploads: this.loadDailyUploads(),
    };
    
    // MÉTRICAS PARA MONITOREO PRODUCTION
    this.metrics = {
      uploads: {
        started: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        queued: 0,
      },
      bytes: {
        uploaded: 0,
        failed: 0,
      },
      performance: {
        avgUploadTime: 0,
        avgProcessingTime: 0,
        successRate: 100,
      },
      errors: {
        network: 0,
        quota: 0,
        validation: 0,
        rateLimit: 0,
        server: 0,
      },
      lastUpdated: Date.now(),
    };
    
    // INICIALIZAR SERVICIO
    this.initializeService();
  }
  
  // ==================== INICIALIZACIÓN ====================
  
  initializeService() {
    // Limpiar uploads antiguos al iniciar
    this.cleanupOldUploads();
    
    // Cargar métricas desde localStorage si existen
    this.loadMetrics();
    
    // Configurar auto-mantenimiento
    this.setupMaintenance();
    
    // Verificar disponibilidad inicial
    this.checkServiceAvailability().catch(() => {
      console.warn('[UploadService] Disponibilidad inicial no verificada');
    });
    
    console.info('[UploadService] Inicializado para producción');
  }
  
  setupMaintenance() {
    // Auto-limpieza cada hora
    setInterval(() => this.cleanupOldUploads(), 3600000);
    
    // Guardar métricas cada 5 minutos
    setInterval(() => this.saveMetrics(), 300000);
    
    // Verificar disponibilidad cada 10 minutos
    setInterval(() => this.checkServiceAvailability(), 600000);
    
    // Reset diario de contadores
    this.scheduleDailyReset();
  }
  
  scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilReset = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyCounters();
      this.scheduleDailyReset(); // Programar siguiente reset
    }, timeUntilReset);
  }
  
  // ==================== MÉTODOS PÚBLICOS PRINCIPALES ====================
  
  /**
   * SUBIR ARCHIVO - MÉTODO PRINCIPAL
   */
  async uploadFile(file, metadata = {}, options = {}) {
    const startTime = Date.now();
    const uploadId = this.generateUploadId();
    
    try {
      // 1. VALIDACIONES PRELIMINARES
      await this.performPreUploadValidation(file, metadata);
      
      // 2. VERIFICAR DISPONIBILIDAD
      if (!await this.ensureServiceAvailable()) {
        throw new Error('Servicio de upload no disponible temporalmente');
      }
      
      // 3. VERIFICAR LÍMITES DIARIOS
      if (!this.checkDailyLimit()) {
        throw new Error('Límite diario de uploads alcanzado. Intenta mañana.');
      }
      
      // 4. VERIFICAR CUOTA
      const quotaCheck = await this.performQuotaCheck(file.size);
      if (!quotaCheck.canUpload) {
        throw new Error(quotaCheck.message);
      }
      
      // 5. INICIALIZAR UPLOAD
      const uploadController = new AbortController();
      this.registerActiveUpload(uploadId, {
        controller: uploadController,
        file,
        metadata,
        startTime,
        status: 'initializing',
        progress: 0,
      });
      
      // 6. EJECUTAR FLUJO COMPLETO
      const result = await this.executeUploadFlow(
        file, 
        metadata, 
        uploadId, 
        uploadController, 
        options
      );
      
      // 7. REGISTRAR ÉXITO
      this.registerSuccessfulUpload(uploadId, result, startTime);
      
      return this.buildSuccessResponse(uploadId, result, startTime);
      
    } catch (error) {
      // 8. MANEJO DE ERRORES
      const normalizedError = this.normalizeUploadError(error, uploadId);
      this.registerFailedUpload(uploadId, normalizedError, startTime);
      
      throw normalizedError;
      
    } finally {
      // 9. LIMPIEZA FINAL
      this.cleanupUpload(uploadId);
    }
  }
  
  /**
   * SUBIR MÚLTIPLES ARCHIVOS (COLA INTELIGENTE)
   */
  async uploadFiles(files, metadataArray = [], options = {}) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, metadataArray[index] || {}, options)
    );
    
    const results = await Promise.allSettled(uploadPromises);
    
    return {
      total: files.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results: results.map((result, index) => ({
        file: files[index]?.name,
        status: result.status,
        value: result.status === 'fulfilled' ? result.value : undefined,
        reason: result.status === 'rejected' ? result.reason.message : undefined,
      })),
    };
  }
  
  /**
   * CANCELAR UPLOAD
   */
  async cancelUpload(uploadId, options = {}) {
    const { deleteFromR2 = false, reason = 'user_cancelled' } = options;
    
    try {
      // 1. Cancelar en frontend
      this.cancelFrontendUpload(uploadId);
      
      // 2. Cancelar en backend
      const backendResult = await this.cancelBackendUpload(uploadId, deleteFromR2);
      
      // 3. Actualizar estado y métricas
      this.registerCancelledUpload(uploadId, reason);
      
      return {
        success: true,
        uploadId,
        cancelled: true,
        reason,
        deleteFromR2,
        backendResult,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error(`[UploadService] Error cancelando upload ${uploadId}:`, error);
      
      return {
        success: false,
        uploadId,
        cancelled: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  /**
   * VERIFICAR ESTADO DE UPLOAD
   */
  async getUploadStatus(uploadId, options = {}) {
    const { forceRefresh = false, cacheFirst = true } = options;
    
    // 1. Verificar en estado activo
    if (this.state.activeUploads.has(uploadId)) {
      return this.getActiveUploadStatus(uploadId);
    }
    
    // 2. Verificar en cache completado
    if (cacheFirst && this.state.completedUploads.has(uploadId)) {
      const cached = this.state.completedUploads.get(uploadId);
      if (Date.now() - cached.timestamp < this.config.cache.statusTTL) {
        return cached.result;
      }
    }
    
    // 3. Verificar en backend
    try {
      const backendStatus = await this.fetchUploadStatus(uploadId);
      return this.normalizeBackendStatus(backendStatus);
    } catch (error) {
      return this.buildErrorStatus(uploadId, error);
    }
  }
  
  /**
   * OBTENER CUOTA DEL USUARIO
   */
  async getUserQuota(options = {}) {
    const { forceRefresh = false } = options;
    
    try {
      const quota = await this.fetchUserQuota(forceRefresh);
      return this.formatQuotaForDisplay(quota);
    } catch (error) {
      console.warn('[UploadService] Error obteniendo cuota:', error.message);
      return this.getDefaultQuotaInfo();
    }
  }
  
  /**
   * VALIDAR ARCHIVO ANTES DE SUBIR
   */
  validateFile(file, strict = true) {
    const errors = [];
    const warnings = [];
    
    // Validaciones básicas
    if (!file || !(file instanceof File)) {
      errors.push('Archivo inválido');
      return { valid: false, errors, warnings };
    }
    
    // Tamaño del archivo
    if (file.size > this.config.limits.maxFileSize) {
      const maxMB = this.config.limits.maxFileSize / (1024 * 1024);
      errors.push(`Tamaño máximo: ${maxMB}MB`);
    } else if (file.size === 0) {
      errors.push('Archivo vacío');
    }
    
    // Tipo MIME
    let mimeValid = false;
    if (file.type) {
      mimeValid = this.config.limits.allowedTypes.includes(file.type);
      if (!mimeValid && strict) {
        errors.push(`Tipo no soportado: ${file.type}`);
      }
    }
    
    // Extensión
    const extension = this.getFileExtension(file.name).toLowerCase();
    const extValid = this.config.limits.allowedExtensions.includes(`.${extension}`);
    
    if (!extValid && strict) {
      errors.push(`Extensión no permitida: .${extension}`);
    }
    
    // Validación cruzada tipo/extensión
    if (mimeValid && !extValid) {
      warnings.push(`Extensión .${extension} no coincide con tipo MIME ${file.type}`);
    }
    
    // Nombre seguro
    if (!this.isSafeFileName(file.name)) {
      errors.push('Nombre de archivo contiene caracteres peligrosos');
    }
    
    // Nombre demasiado largo
    if (file.name.length > 255) {
      warnings.push('Nombre de archivo muy largo (se recomienda menos de 255 caracteres)');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: `.${extension}`,
        lastModified: file.lastModified,
        formattedSize: this.formatBytes(file.size),
      },
    };
  }
  
  // ==================== MÉTODOS DE ESTADO Y MÉTRICAS ====================
  
  /**
   * OBTENER ESTADO DEL SERVICIO
   */
  getServiceStatus() {
    return {
      availability: {
        service: this.state.serviceAvailable,
        lastCheck: new Date(this.state.lastAvailabilityCheck).toISOString(),
        uptime: Date.now() - this.state.lastAvailabilityCheck,
      },
      limits: {
        daily: {
          used: this.state.dailyUploads.count,
          remaining: Math.max(0, this.config.limits.maxDailyUploads - this.state.dailyUploads.count),
          max: this.config.limits.maxDailyUploads,
        },
        fileSize: this.config.limits.maxFileSize,
        concurrent: this.config.limits.maxConcurrent,
      },
      queue: {
        active: this.state.activeUploads.size,
        pending: this.state.pendingQueue.length,
        maxConcurrent: this.config.limits.maxConcurrent,
      },
      performance: this.calculatePerformanceMetrics(),
      cache: {
        active: this.state.activeUploads.size,
        completed: this.state.completedUploads.size,
        maxCompleted: this.config.cache.maxCompleted,
      },
    };
  }
  
  /**
   * OBTENER UPLOADS ACTIVOS
   */
  getActiveUploads() {
    return Array.from(this.state.activeUploads.entries()).map(([id, data]) => ({
      id,
      fileName: data.file?.name || 'Desconocido',
      fileSize: data.file?.size || 0,
      progress: data.progress || 0,
      status: data.status || 'unknown',
      elapsed: Date.now() - (data.startTime || Date.now()),
      speed: this.calculateUploadSpeed(id, data),
      estimatedRemaining: this.calculateEstimatedRemaining(id, data),
    }));
  }
  
  /**
   * OBTENER MÉTRICAS DETALLADAS
   */
  getDetailedMetrics() {
    this.updatePerformanceMetrics();
    
    return {
      summary: {
        totalUploads: this.metrics.uploads.started,
        successRate: this.metrics.performance.successRate,
        totalBytes: this.metrics.bytes.uploaded,
        uptime: Date.now() - this.metrics.lastUpdated,
      },
      uploads: { ...this.metrics.uploads },
      bytes: { ...this.metrics.bytes },
      performance: { ...this.metrics.performance },
      errors: { ...this.metrics.errors },
      timestamps: {
        lastUpdated: new Date(this.metrics.lastUpdated).toISOString(),
        serviceStart: new Date(this.metrics.lastUpdated - (Date.now() - this.metrics.lastUpdated)).toISOString(),
      },
    };
  }
  
  /**
   * LIMPIAR SERVICIO (para logout o reinicio)
   */
  cleanup() {
    console.info('[UploadService] Limpiando servicio...');
    
    // 1. Cancelar todos los uploads activos
    this.cancelAllActiveUploads();
    
    // 2. Limpiar estado interno
    this.state.activeUploads.clear();
    this.state.pendingQueue = [];
    this.state.completedUploads.clear();
    
    // 3. Resetear métricas temporales (mantener históricas)
    this.state.dailyUploads = this.resetDailyUploads();
    
    // 4. Limpiar cache de localStorage
    this.cleanLocalStorage();
    
    console.info('[UploadService] Limpieza completada');
    
    return {
      success: true,
      cleared: {
        activeUploads: this.state.activeUploads.size,
        completedUploads: this.state.completedUploads.size,
        pendingQueue: this.state.pendingQueue.length,
      },
    };
  }
  
  // ==================== MÉTODOS DE ADMINISTRACIÓN (Solo staff) ====================
  
  /**
   * DASHBOARD DE ADMINISTRACIÓN
   */
  async getAdminDashboard() {
    try {
      const response = await this.adminRequest('GET', this.config.endpoints.admin.dashboard);
      return response;
    } catch (error) {
      throw new Error(`Error obteniendo dashboard: ${error.message}`);
    }
  }
  
  /**
   * ESTADÍSTICAS DETALLADAS
   */
  async getAdminStats(days = 30) {
    try {
      const response = await this.adminRequest('GET', 
        `${this.config.endpoints.admin.stats}?days=${days}`
      );
      return response;
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }
  
  /**
   * LIMPIAR UPLOADS EXPIRADOS
   */
  async cleanupExpiredUploads(deleteFromR2 = false) {
    try {
      const response = await this.adminRequest('POST', 
        this.config.endpoints.admin.cleanup,
        { delete_from_r2: deleteFromR2 }
      );
      return response;
    } catch (error) {
      throw new Error(`Error en limpieza: ${error.message}`);
    }
  }
  
  // ==================== MÉTODOS PRIVADOS - CORE ====================
  
  /**
   * EJECUTAR FLUJO COMPLETO DE UPLOAD
   */
  async executeUploadFlow(file, metadata, uploadId, controller, options) {
    const { onProgress, onStatusChange } = options;
    const startTime = Date.now();
    
    try {
      // 1. SOLICITAR URL FIRMADA
      this.updateUploadStatus(uploadId, 'requesting_url', 10);
      const uploadData = await this.requestSignedUrl(file, metadata, controller.signal);
      
      // 2. SUBIR A R2
      this.updateUploadStatus(uploadId, 'uploading_to_r2', 25);
      const fileKey = await this.directUploadToR2(
        file, 
        uploadData, 
        this.createProgressHandler(uploadId, onProgress), 
        controller.signal
      );
      
      // 3. CONFIRMAR UPLOAD
      this.updateUploadStatus(uploadId, 'confirming', 75);
      const confirmResult = await this.confirmUpload(uploadData.upload_id, controller.signal);
      
      // 4. ESPERAR PROCESAMIENTO (si es necesario)
      let finalResult;
      if (confirmResult.processing_started) {
        this.updateUploadStatus(uploadId, 'processing', 85);
        finalResult = await this.waitForProcessing(uploadData.upload_id, controller.signal);
      } else {
        finalResult = confirmResult;
      }
      
      this.updateUploadStatus(uploadId, 'completed', 100);
      
      return {
        uploadId: uploadData.upload_id,
        fileKey,
        processingTime: Date.now() - startTime,
        ...finalResult,
      };
      
    } catch (error) {
      // Manejo específico de errores por etapa
      const currentStatus = this.state.activeUploads.get(uploadId)?.status;
      throw this.handleStageError(error, currentStatus, uploadId);
    }
  }
  
  /**
   * SOLICITAR URL FIRMADA
   */
  async requestSignedUrl(file, metadata, signal) {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(this.buildUrl(this.config.endpoints.request), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        metadata: {
          original_name: file.name,
          uploaded_via: 'web_app',
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ...metadata,
        },
      }),
      signal,
    });
    
    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'request_signed_url');
    }
    
    const data = await response.json();
    
    // Validar respuesta
    this.validateUploadResponse(data);
    
    return {
      url: data.upload_url,
      fields: data.fields,
      key: data.file_key,
      upload_id: data.upload_id,
      expires_at: data.expires_at,
      expires_in: data.expires_in || 3600,
      confirmation_url: data.confirmation_url,
    };
  }
  
  /**
   * UPLOAD DIRECTO A R2
   */
  async directUploadToR2(file, uploadData, onProgress, signal) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      const startTime = Date.now();
      let lastProgressTime = startTime;
      let lastProgressBytes = 0;
      
      // Agregar campos
      Object.entries(uploadData.fields).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      // Agregar archivo
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      // Configurar timeout
      xhr.timeout = this.config.timeouts.upload;
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          
          // Calcular velocidad
          const now = Date.now();
          const timeDiff = (now - lastProgressTime) / 1000;
          const bytesDiff = event.loaded - lastProgressBytes;
          const speed = bytesDiff / timeDiff;
          
          onProgress(progress, {
            loaded: event.loaded,
            total: event.total,
            speed: speed,
            estimatedRemaining: speed > 0 ? (event.total - event.loaded) / speed : null,
            timeElapsed: (now - startTime) / 1000,
          });
          
          lastProgressTime = now;
          lastProgressBytes = event.loaded;
        }
      });
      
      // Event handlers
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(uploadData.key);
        } else {
          reject(new Error(`R2 upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during R2 upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('R2 upload aborted'));
      });
      
      xhr.addEventListener('timeout', () => {
        reject(new Error(`R2 upload timeout (${this.config.timeouts.upload}ms)`));
      });
      
      // Conectar abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload cancelled'));
        });
      }
      
      // Iniciar upload
      xhr.open('POST', uploadData.url, true);
      xhr.send(formData);
    });
  }
  
  /**
   * CONFIRMAR UPLOAD
   */
  async confirmUpload(uploadId, signal) {
    const token = this.getAuthToken();
    
    const response = await fetch(
      this.buildUrl(this.config.endpoints.confirm.replace(':id', uploadId)), 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delete_invalid: false,
        }),
        signal,
      }
    );
    
    if (!response.ok) {
      throw await this.parseErrorResponse(response, 'confirm_upload');
    }
    
    return await response.json();
  }
  
  // ==================== HELPERS Y UTILIDADES ====================
  
  /**
   * CONSTRUIR URL COMPLETA
   */
  buildUrl(endpoint) {
    return `${this.config.baseURL}${endpoint}`;
  }
  
  /**
   * OBTENER TOKEN DE AUTENTICACIÓN
   */
  getAuthToken() {
    // Implementación específica de tu app
    return localStorage.getItem('accessToken') || 
           sessionStorage.getItem('accessToken') ||
           null;
  }
  
  /**
   * OBTENER URL BASE SEGÚN ENTORNO
   */
  getApiBaseURL() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'http://localhost:8000';
    }
    
    if (hostname.includes('staging.')) {
      return 'https://staging.api.djidjimusic.com';
    }
    
    if (hostname.includes('dev.')) {
      return 'https://dev.api.djidjimusic.com';
    }
    
    return 'https://api.djidjimusic.com';
  }
  
  /**
   * GENERAR ID ÚNICO PARA UPLOAD
   */
  generateUploadId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `upload_${timestamp}_${random}`;
  }
  
  /**
   * FORMATEAR BYTES A STRING LEGIBLE
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  /**
   * OBTENER EXTENSIÓN DEL ARCHIVO
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }
  
  /**
   * VALIDAR NOMBRE DE ARCHIVO SEGURO
   */
  isSafeFileName(filename) {
    const dangerousPatterns = [
      /\.\./,           // Path traversal
      /\//,             // Directory separators
      /\\/,             // Windows separators
      /[\x00-\x1f\x7f]/, // Control characters
      /[<>:"|?*]/,      // Invalid Windows characters
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(filename));
  }
  
  /**
   * CREAR MANEJADOR DE PROGRESO
   */
  createProgressHandler(uploadId, externalHandler) {
    return (progress, details) => {
      // Actualizar estado interno
      this.updateUploadStatus(uploadId, 'uploading_to_r2', progress);
      
      // Llamar handler externo si existe
      if (externalHandler) {
        externalHandler(progress, details);
      }
      
      // Emitir evento global
      this.emitProgressEvent(uploadId, progress, details);
    };
  }
  
  /**
   * EMITIR EVENTO DE PROGRESO
   */
  emitProgressEvent(uploadId, progress, details) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      const event = new CustomEvent('upload-progress', {
        detail: {
          uploadId,
          progress,
          ...details,
          timestamp: new Date().toISOString(),
        },
      });
      
      window.dispatchEvent(event);
    }
  }
  
  /**
   * MANEJAR ERROR POR ETAPA
   */
  handleStageError(error, stage, uploadId) {
    let errorType = 'unknown';
    let userMessage = error.message;
    
    switch (stage) {
      case 'requesting_url':
        errorType = 'url_request_failed';
        userMessage = 'Error solicitando URL para upload';
        break;
        
      case 'uploading_to_r2':
        errorType = 'r2_upload_failed';
        userMessage = 'Error subiendo archivo al servidor';
        break;
        
      case 'confirming':
        errorType = 'confirmation_failed';
        userMessage = 'Error confirmando upload';
        break;
        
      case 'processing':
        errorType = 'processing_failed';
        userMessage = 'Error procesando archivo';
        break;
    }
    
    const enhancedError = new Error(userMessage);
    enhancedError.originalError = error;
    enhancedError.errorType = errorType;
    enhancedError.stage = stage;
    enhancedError.uploadId = uploadId;
    enhancedError.timestamp = new Date().toISOString();
    
    return enhancedError;
  }
  
  /**
   * PARSEAR ERROR DE RESPUESTA
   */
  async parseErrorResponse(response, context) {
    try {
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
      
      const error = new Error(data.message || data.error || `Error ${response.status}`);
      error.status = response.status;
      error.context = context;
      error.data = data;
      
      // Clasificar error
      if (response.status === 401) error.errorType = 'authentication';
      else if (response.status === 403) error.errorType = 'authorization';
      else if (response.status === 404) error.errorType = 'not_found';
      else if (response.status === 429) error.errorType = 'rate_limit';
      else if (response.status >= 500) error.errorType = 'server_error';
      else error.errorType = 'client_error';
      
      return error;
    } catch {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.context = context;
      error.errorType = 'network';
      
      return error;
    }
  }
  
  // ... (continuaría con más métodos helper)
  
  /**
   * CARGAR UPLOADS DIARIOS DESDE LOCALSTORAGE
   */
  loadDailyUploads() {
    try {
      const stored = localStorage.getItem('upload_daily_stats');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[UploadService] Error cargando estadísticas diarias:', e);
    }
    
    return {
      date: new Date().toDateString(),
      count: 0,
      totalSize: 0,
    };
  }
  
  /**
   * GUARDAR UPLOADS DIARIOS EN LOCALSTORAGE
   */
  saveDailyUploads() {
    try {
      localStorage.setItem('upload_daily_stats', JSON.stringify(this.state.dailyUploads));
    } catch (e) {
      console.warn('[UploadService] Error guardando estadísticas diarias:', e);
    }
  }
  
  /**
   * INCREMENTAR CONTADOR DIARIO
   */
  incrementDailyUploads(fileSize) {
    const today = new Date().toDateString();
    
    if (this.state.dailyUploads.date !== today) {
      this.state.dailyUploads = {
        date: today,
        count: 0,
        totalSize: 0,
      };
    }
    
    this.state.dailyUploads.count++;
    this.state.dailyUploads.totalSize += fileSize;
    
    this.saveDailyUploads();
  }
  
  /**
   * VERIFICAR LÍMITE DIARIO
   */
  checkDailyLimit() {
    return this.state.dailyUploads.count < this.config.limits.maxDailyUploads;
  }
  
  /**
   * RESETEAR CONTADORES DIARIOS
   */
  resetDailyCounters() {
    this.state.dailyUploads = {
      date: new Date().toDateString(),
      count: 0,
      totalSize: 0,
    };
    
    this.saveDailyUploads();
    console.info('[UploadService] Contadores diarios reseteados');
  }
  
  /**
   * CARGAR MÉTRICAS DESDE LOCALSTORAGE
   */
  loadMetrics() {
    try {
      const stored = localStorage.getItem('upload_service_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Solo cargar métricas históricas, no las temporales
        if (data.uploads && data.bytes) {
          this.metrics.uploads.started = data.uploads.started || 0;
          this.metrics.uploads.completed = data.uploads.completed || 0;
          this.metrics.uploads.failed = data.uploads.failed || 0;
          this.metrics.bytes.uploaded = data.bytes.uploaded || 0;
        }
      }
    } catch (e) {
      console.warn('[UploadService] Error cargando métricas:', e);
    }
  }
  
  /**
   * GUARDAR MÉTRICAS EN LOCALSTORAGE
   */
  saveMetrics() {
    try {
      this.metrics.lastUpdated = Date.now();
      localStorage.setItem('upload_service_metrics', JSON.stringify(this.metrics));
    } catch (e) {
      console.warn('[UploadService] Error guardando métricas:', e);
    }
  }
  
  /**
   * ACTUALIZAR MÉTRICAS DE PERFORMANCE
   */
  updatePerformanceMetrics() {
    if (this.metrics.uploads.started > 0) {
      this.metrics.performance.successRate = 
        (this.metrics.uploads.completed / this.metrics.uploads.started) * 100;
    }
  }
  
  /**
   * CALCULAR MÉTRICAS DE PERFORMANCE
   */
  calculatePerformanceMetrics() {
    return {
      successRate: this.metrics.performance.successRate,
      avgUploadSpeed: this.calculateAverageUploadSpeed(),
      avgProcessingTime: this.metrics.performance.avgProcessingTime,
      reliability: this.calculateServiceReliability(),
    };
  }
  
  // ==================== MANEJO DE CACHE Y ESTADO ====================
  
  /**
   * REGISTRAR UPLOAD ACTIVO
   */
  registerActiveUpload(uploadId, data) {
    this.state.activeUploads.set(uploadId, {
      ...data,
      registeredAt: Date.now(),
      lastUpdate: Date.now(),
    });
    
    this.metrics.uploads.started++;
  }
  
  /**
   * ACTUALIZAR ESTADO DE UPLOAD
   */
  updateUploadStatus(uploadId, status, progress = null) {
    if (this.state.activeUploads.has(uploadId)) {
      const upload = this.state.activeUploads.get(uploadId);
      upload.status = status;
      upload.lastUpdate = Date.now();
      
      if (progress !== null) {
        upload.progress = progress;
      }
      
      this.state.activeUploads.set(uploadId, upload);
      
      // Emitir evento
      this.emitStatusEvent(uploadId, status, progress);
    }
  }
  
  /**
   * REGISTRAR UPLOAD EXITOSO
   */
  registerSuccessfulUpload(uploadId, result, startTime) {
    const uploadTime = Date.now() - startTime;
    
    // Actualizar métricas
    this.metrics.uploads.completed++;
    this.metrics.bytes.uploaded += result.fileSize || 0;
    
    // Actualizar métricas de performance
    this.updatePerformanceMetrics();
    
    // Mover a completados
    this.state.completedUploads.set(uploadId, {
      result,
      timestamp: Date.now(),
      uploadTime,
    });
    
    // Incrementar contador diario
    this.incrementDailyUploads(result.fileSize || 0);
    
    // Limitar tamaño de cache completado
    if (this.state.completedUploads.size > this.config.cache.maxCompleted) {
      const oldestKey = Array.from(this.state.completedUploads.keys())
        .sort((a, b) => this.state.completedUploads.get(a).timestamp - 
                      this.state.completedUploads.get(b).timestamp)[0];
      this.state.completedUploads.delete(oldestKey);
    }
    
    // Emitir evento de éxito
    this.emitSuccessEvent(uploadId, result);
  }
  
  /**
   * REGISTRAR UPLOAD FALLIDO
   */
  registerFailedUpload(uploadId, error, startTime) {
    this.metrics.uploads.failed++;
    this.metrics.bytes.failed += error.fileSize || 0;
    
    // Clasificar error
    const errorType = error.errorType || 'unknown';
    if (this.metrics.errors[errorType] !== undefined) {
      this.metrics.errors[errorType]++;
    }
    
    // Emitir evento de error
    this.emitErrorEvent(uploadId, error);
  }
  
  /**
   * REGISTRAR UPLOAD CANCELADO
   */
  registerCancelledUpload(uploadId, reason) {
    this.metrics.uploads.cancelled++;
    
    // Emitir evento de cancelación
    this.emitCancelEvent(uploadId, reason);
  }
  
  /**
   * LIMPIAR UPLOAD DEL ESTADO
   */
  cleanupUpload(uploadId) {
    this.state.activeUploads.delete(uploadId);
  }
  
  /**
   * CANCELAR TODOS LOS UPLOADS ACTIVOS
   */
  cancelAllActiveUploads() {
    for (const [uploadId, { controller }] of this.state.activeUploads.entries()) {
      try {
        controller.abort();
        console.log(`[UploadService] Cancelado upload: ${uploadId}`);
      } catch (e) {
        console.warn(`[UploadService] Error cancelando upload ${uploadId}:`, e);
      }
    }
  }
  
  // ==================== EVENTOS ====================
  
  /**
   * EMITIR EVENTO DE ESTADO
   */
  emitStatusEvent(uploadId, status, progress) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upload-status-changed', {
        detail: { uploadId, status, progress, timestamp: new Date().toISOString() }
      }));
    }
  }
  
  /**
   * EMITIR EVENTO DE ÉXITO
   */
  emitSuccessEvent(uploadId, result) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upload-success', {
        detail: { uploadId, result, timestamp: new Date().toISOString() }
      }));
    }
  }
  
  /**
   * EMITIR EVENTO DE ERROR
   */
  emitErrorEvent(uploadId, error) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upload-error', {
        detail: { 
          uploadId, 
          error: {
            message: error.message,
            type: error.errorType,
            stage: error.stage,
            originalError: error.originalError?.message,
          },
          timestamp: new Date().toISOString() 
        }
      }));
    }
  }
  
  /**
   * EMITIR EVENTO DE CANCELACIÓN
   */
  emitCancelEvent(uploadId, reason) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upload-cancelled', {
        detail: { uploadId, reason, timestamp: new Date().toISOString() }
      }));
    }
  }
  
  // ==================== MANEJO DE CACHE ====================
  
  /**
   * LIMPIAR UPLOADS ANTIGUOS
   */
  cleanupOldUploads() {
    const cutoff = Date.now() - this.config.cache.completedTTL;
    let cleaned = 0;
    
    // Limpiar completados antiguos
    for (const [uploadId, data] of this.state.completedUploads.entries()) {
      if (data.timestamp < cutoff) {
        this.state.completedUploads.delete(uploadId);
        cleaned++;
      }
    }
    
    // Limpiar localStorage antiguo
    this.cleanOldLocalStorage(cutoff);
    
    if (cleaned > 0) {
      console.log(`[UploadService] Limpiados ${cleaned} uploads antiguos`);
    }
    
    return cleaned;
  }
  
  /**
   * LIMPIAR LOCALSTORAGE ANTIGUO
   */
  cleanOldLocalStorage(cutoff) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('upload_') || key.startsWith('djimusic_upload_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp && data.timestamp < cutoff) {
              localStorage.removeItem(key);
            }
          } catch {
            // Si hay error al parsear, eliminar
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.warn('[UploadService] Error limpiando localStorage:', e);
    }
  }
  
  /**
   * LIMPIAR LOCALSTORAGE COMPLETO
   */
  cleanLocalStorage() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('upload_') || 
            key.startsWith('djimusic_upload_') ||
            key === 'upload_service_metrics' ||
            key === 'upload_daily_stats') {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`[UploadService] Limpiados ${keysToRemove.length} items de localStorage`);
    } catch (e) {
      console.warn('[UploadService] Error limpiando localStorage:', e);
    }
  }
  
  // ==================== VERIFICACIÓN DE DISPONIBILIDAD ====================
  
  /**
   * VERIFICAR DISPONIBILIDAD DEL SERVICIO
   */
  async checkServiceAvailability() {
    // Verificar si ya se verificó recientemente
    const timeSinceLastCheck = Date.now() - this.state.lastAvailabilityCheck;
    if (timeSinceLastCheck < 60000) { // 1 minuto
      return this.state.serviceAvailable;
    }
    
    try {
      const response = await fetch(`${this.config.baseURL}/health/`, {
        signal: AbortSignal.timeout(5000),
      });
      
      this.state.serviceAvailable = response.ok;
      this.state.lastAvailabilityCheck = Date.now();
      
      // Emitir evento de cambio de disponibilidad
      this.emitAvailabilityEvent(this.state.serviceAvailable);
      
      return this.state.serviceAvailable;
      
    } catch (error) {
      console.warn('[UploadService] Error verificando disponibilidad:', error.message);
      this.state.serviceAvailable = false;
      this.state.lastAvailabilityCheck = Date.now();
      
      this.emitAvailabilityEvent(false);
      
      return false;
    }
  }
  
  /**
   * ASEGURAR QUE EL SERVICIO ESTÉ DISPONIBLE
   */
  async ensureServiceAvailable() {
    if (!this.state.serviceAvailable) {
      return await this.checkServiceAvailability();
    }
    return true;
  }
  
  /**
   * EMITIR EVENTO DE DISPONIBILIDAD
   */
  emitAvailabilityEvent(available) {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upload-service-availability', {
        detail: { available, timestamp: new Date().toISOString() }
      }));
    }
  }
  
  // ==================== VALIDACIONES PRE-UPLOAD ====================
  
  /**
   * REALIZAR VALIDACIONES PRE-UPLOAD
   */
  async performPreUploadValidation(file, metadata) {
    // 1. Validar archivo
    const fileValidation = this.validateFile(file, true);
    if (!fileValidation.valid) {
      throw new Error(`Validación de archivo falló: ${fileValidation.errors.join(', ')}`);
    }
    
    // 2. Verificar metadatos
    this.validateMetadata(metadata);
    
    // 3. Verificar tamaño contra cuota disponible
    const quota = await this.getUserQuota({ forceRefresh: true });
    if (quota.remaining < file.size) {
      throw new Error(`Espacio insuficiente. Disponible: ${this.formatBytes(quota.remaining)}`);
    }
    
    return true;
  }
  
  /**
   * VALIDAR METADATOS
   */
  validateMetadata(metadata) {
    const maxMetadataSize = 1024 * 10; // 10KB max para metadata
    
    if (JSON.stringify(metadata).length > maxMetadataSize) {
      throw new Error('Metadatos demasiado grandes (máx. 10KB)');
    }
    
    // Validar campos específicos si existen
    if (metadata.artist && metadata.artist.length > 200) {
      throw new Error('Nombre de artista demasiado largo');
    }
    
    if (metadata.title && metadata.title.length > 200) {
      throw new Error('Título demasiado largo');
    }
    
    return true;
  }
  
  /**
   * VERIFICAR CUOTA
   */
  async performQuotaCheck(fileSize) {
    try {
      const quota = await this.getUserQuota({ forceRefresh: true });
      
      return {
        canUpload: quota.remaining >= fileSize,
        message: quota.remaining >= fileSize 
          ? null 
          : `Espacio insuficiente. Disponible: ${this.formatBytes(quota.remaining)}`,
        quota,
      };
    } catch (error) {
      // Si no podemos verificar cuota, permitir (backend lo validará)
      console.warn('[UploadService] No se pudo verificar cuota:', error.message);
      return { canUpload: true, message: null, quota: null };
    }
  }
  
  // ... (más métodos específicos)
}

// Singleton instance para uso global
let uploadServiceInstance = null;

export const getUploadService = () => {
  if (!uploadServiceInstance) {
    uploadServiceInstance = new UploadService();
  }
  return uploadServiceInstance;
};
// Al final de tu uploadService.js, añade:


export default getUploadService();

// useUpload.js - al final del archivo
