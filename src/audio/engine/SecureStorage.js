// ============================================
// src/audio/engine/SecureStorage.js
// Almacenamiento seguro con IndexedDB + Web Crypto API
// AES-256-GCM - NATIVO DEL NAVEGADOR
// ============================================

class SecureStorage {
  constructor() {
    this.dbName = 'DjiDjiSecureDB';
    this.dbVersion = 1;
    this.db = null;
    this.storeName = 'encryptedSongs';
    this.initPromise = null;
    this.encryptionKey = null;
    this.currentUserId = null;
  }

  /**
   * Obtener ID del usuario actual
   */
  getCurrentUserId() {
    try {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('access_token');
      
      if (!token) return 'anonymous';
      
      // Intentar decodificar JWT para obtener user_id
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.user_id || payload.sub || payload.id || 'anonymous';
      }
      
      return 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Inicializar base de datos
   */
  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.currentUserId = this.getCurrentUserId();

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[SecureStorage] Error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[SecureStorage] ✅ Base de datos inicializada');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('songId', 'songId', { unique: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Derivar clave de encriptación del token (PBKDF2)
   */
  async getEncryptionKey() {
    if (this.encryptionKey) return this.encryptionKey;

    try {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('access_token') || 
                    'default-key-do-not-use';

      // Convertir token a buffer
      const encoder = new TextEncoder();
      const tokenBuffer = encoder.encode(token);
      
      // Salt fijo (en producción, puedes tener uno por usuario)
      const salt = encoder.encode('DjiDjiMusic-Salt-V2');

      // Importar token como material de clave
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        tokenBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derivar clave AES-256
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000, // Suficiente para móvil
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      console.log('[SecureStorage] 🔑 Clave de encriptación generada');
      return this.encryptionKey;

    } catch (error) {
      console.error('[SecureStorage] Error generando clave:', error);
      throw new Error('No se pudo generar clave de seguridad');
    }
  }

  /**
   * Encriptar datos con AES-256-GCM
   */
  async encrypt(data, songId) {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      
      // Generar IV aleatorio (12 bytes recomendado para GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Preparar payload con metadatos
      const payload = {
        data: data,
        songId: songId,
        userId: this.currentUserId,
        timestamp: Date.now()
      };
      
      const encodedPayload = encoder.encode(JSON.stringify(payload));
      
      // Encriptar
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: encoder.encode(songId) // Vincular al ID de canción
        },
        key,
        encodedPayload
      );

      return {
        data: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv)
      };
      
    } catch (error) {
      console.error('[SecureStorage] Error encriptando:', error);
      throw error;
    }
  }

  /**
   * Desencriptar datos
   */
  async decrypt(encryptedData, iv, expectedSongId) {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      // Desencriptar
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv),
          additionalData: encoder.encode(expectedSongId)
        },
        key,
        new Uint8Array(encryptedData)
      );

      const decryptedStr = decoder.decode(decryptedBuffer);
      const payload = JSON.parse(decryptedStr);
      
      // Verificar integridad
      if (payload.songId !== expectedSongId) {
        throw new Error('ID de canción no coincide');
      }
      
      if (payload.userId !== this.currentUserId) {
        throw new Error('Usuario no autorizado');
      }
      
      return payload.data;
      
    } catch (error) {
      console.error('[SecureStorage] Error desencriptando:', error);
      throw error;
    }
  }

  /**
   * Convertir blob a base64
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convertir base64 a blob
   */
  base64ToBlob(base64, mimeType) {
    return fetch(base64).then(res => res.blob());
  }

  /**
   * Guardar canción encriptada
   */
  async storeSong(songId, blob, metadata) {
    await this.init();

    try {
      // Convertir blob a base64
      const base64Data = await this.blobToBase64(blob);
      
      // Encriptar
      const { data: encryptedData, iv } = await this.encrypt(base64Data, songId);
      
      // Crear registro
      const record = {
        id: `${songId}_${Date.now()}`,
        songId: songId,
        userId: this.currentUserId,
        encryptedData: encryptedData,
        iv: iv,
        metadata: {
          title: metadata.title || 'Canción',
          artist: metadata.artist || 'Artista'
        },
        downloadedAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 días
        fileSize: blob.size,
        mimeType: blob.type || 'audio/mpeg'
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.put(record);
        
        request.onsuccess = () => {
          console.log(`[SecureStorage] ✅ Canción ${songId} guardada`, {
            size: (blob.size / 1024 / 1024).toFixed(2) + 'MB',
            expires: new Date(record.expiresAt).toLocaleDateString()
          });
          resolve(record);
        };
        
        request.onerror = () => {
          console.error('[SecureStorage] Error guardando:', request.error);
          reject(request.error);
        };
      });

    } catch (error) {
      console.error('[SecureStorage] Error en storeSong:', error);
      throw error;
    }
  }

  /**
   * Obtener canción desencriptada
   */
  async getSong(songId) {
    await this.init();

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('songId');
        
        const request = index.get(songId);
        
        request.onsuccess = async () => {
          const record = request.result;
          
          if (!record) {
            resolve(null);
            return;
          }

          // Verificar usuario
          if (record.userId !== this.currentUserId) {
            console.warn('[SecureStorage] Acceso denegado - otro usuario');
            resolve(null);
            return;
          }

          // Verificar expiración
          if (record.expiresAt < Date.now()) {
            console.log(`[SecureStorage] ⏰ Canción ${songId} expirada`);
            await this.removeSong(songId);
            resolve(null);
            return;
          }

          try {
            // Desencriptar
            const decryptedBase64 = await this.decrypt(
              record.encryptedData, 
              record.iv, 
              songId
            );
            
            // Convertir base64 a blob
            const blob = await this.base64ToBlob(decryptedBase64, record.mimeType);
            
            resolve({
              blob,
              metadata: record.metadata,
              downloadedAt: record.downloadedAt,
              expiresAt: record.expiresAt,
              fileSize: record.fileSize
            });
            
          } catch (decryptError) {
            console.error('[SecureStorage] Error desencriptando:', decryptError);
            // Si falla la desencriptación, eliminar el registro corrupto
            await this.removeSong(songId);
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error('[SecureStorage] Error obteniendo:', request.error);
          reject(request.error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar disponibilidad
   */
  async isAvailable(songId) {
    await this.init();

    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('songId');
      
      const request = index.get(songId);
      
      request.onsuccess = () => {
        const record = request.result;
        if (!record) {
          resolve(false);
          return;
        }
        
        const isValid = record.userId === this.currentUserId && 
                       record.expiresAt > Date.now();
        
        resolve(isValid);
      };
      
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Eliminar canción
   */
  async removeSong(songId) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('songId');
      
      const getRequest = index.get(songId);
      
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (!record) {
          resolve(false);
          return;
        }
        
        const deleteRequest = store.delete(record.id);
        
        deleteRequest.onsuccess = () => {
          console.log(`[SecureStorage] 🗑️ Canción ${songId} eliminada`);
          resolve(true);
        };
        
        deleteRequest.onerror = () => {
          console.error('[SecureStorage] Error eliminando:', deleteRequest.error);
          reject(deleteRequest.error);
        };
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  /**
   * Obtener todas las canciones del usuario
   */
  async getAllSongs() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      
      const request = index.getAll(this.currentUserId);
      const now = Date.now();
      
      request.onsuccess = () => {
        const validSongs = request.result.filter(song => song.expiresAt > now);
        resolve(validSongs);
      };
      
      request.onerror = () => {
        console.error('[SecureStorage] Error obteniendo todas:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpiar canciones expiradas
   */
  async cleanup() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      
      const request = index.openCursor(range);
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Solo eliminar si es del usuario actual
          if (cursor.value.userId === this.currentUserId) {
            store.delete(cursor.primaryKey);
            deletedCount++;
          }
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(`[SecureStorage] 🧹 Limpiadas ${deletedCount} canciones expiradas`);
          }
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => {
        console.error('[SecureStorage] Error en cleanup:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpiar todo (para logout)
   */
  async clearAll() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      
      const request = index.getAllKeys(this.currentUserId);
      
      request.onsuccess = () => {
        const keys = request.result;
        let deleted = 0;
        
        keys.forEach(key => {
          store.delete(key);
          deleted++;
        });
        
        console.log(`[SecureStorage] 🧹 Eliminadas ${deleted} canciones del usuario`);
        resolve(deleted);
      };
      
      request.onerror = () => {
        console.error('[SecureStorage] Error limpiando:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Obtener estadísticas
   */
  async getStats() {
    const songs = await this.getAllSongs();
    
    const totalSize = songs.reduce((sum, song) => sum + (song.fileSize || 0), 0);
    
    return {
      totalSongs: songs.length,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      songs: songs.map(s => ({
        songId: s.songId,
        title: s.metadata?.title,
        artist: s.metadata?.artist,
        downloadedAt: new Date(s.downloadedAt).toLocaleDateString(),
        expiresAt: new Date(s.expiresAt).toLocaleDateString(),
        fileSize: (s.fileSize / 1024 / 1024).toFixed(2) + ' MB'
      }))
    };
  }

  /**
   * Cerrar conexión
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.encryptionKey = null;
      this.initPromise = null;
    }
  }
}

// Exportar singleton
export const secureStorage = new SecureStorage();