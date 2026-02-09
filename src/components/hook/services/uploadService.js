// services/uploadService.js - VERSIÓN CORREGIDA
import { api } from '../../../components/hook/services/apia';

class UploadService {
  /**
   * Obtener token de localStorage - COMPATIBILIDAD CON AMBOS NOMBRES
   */
  getToken() {
    return localStorage.getItem('accessToken') || 
           localStorage.getItem('access_token');
  }

  /**
   * 1. Solicitar URL de upload directo
   * POST /api2/upload/direct/request/
   */
  async requestUpload(file) {
    const payload = {
      file_name: this.sanitizeFileName(file.name),
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      metadata: {
        original_name: file.name,
        last_modified: file.lastModified,
        user_agent: navigator.userAgent,
      },
    };

    const response = await api.post('/upload/direct/request/', payload);
    return response.data;
  }

  /**
   * 2. Subir archivo a R2 usando URL pre-firmada
   */
  async uploadToR2(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (onProgress && event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }

  /**
   * 3. Confirmar upload completado
   * POST /api2/upload/direct/confirm/<upload_id>/
   */
  async confirmUpload(uploadId, deleteInvalid = false) {
    const response = await api.post(`/upload/direct/confirm/${uploadId}/`, {
      delete_invalid: deleteInvalid,
    });
    return response.data;
  }

  /**
   * 4. Verificar estado de upload
   * GET /api2/upload/direct/status/<upload_id>/
   */
  async getUploadStatus(uploadId) {
    const response = await api.get(`/upload/direct/status/${uploadId}/`);
    return response.data;
  }

  /**
   * 5. Obtener cuota del usuario
   * GET /api2/upload/quota/
   */
  async getUserQuota() {
    const response = await api.get('/upload/quota/');
    return response.data;
  }

  /**
   * 6. Cancelar upload
   * POST /api2/upload/direct/cancel/<upload_id>/
   */
  async cancelUpload(uploadId, deleteFromR2 = false) {
    const response = await api.post(`/upload/direct/cancel/${uploadId}/`, {
      delete_from_r2: deleteFromR2,
    });
    return response.data;
  }

  /**
   * Flujo completo de upload
   */
  async uploadFile(file, onProgress) {
    console.log('🚀 Iniciando upload:', file.name);
    
    // Paso 1: Solicitar URL
    console.log('📡 Solicitando URL de upload...');
    const requestData = await this.requestUpload(file);
    
    // Paso 2: Subir a R2
    console.log('☁️ Subiendo a R2...');
    await this.uploadToR2(requestData.upload_url, file, onProgress);
    
    // Paso 3: Confirmar
    console.log('✅ Confirmando upload...');
    const confirmation = await this.confirmUpload(requestData.upload_id);
    
    return {
      success: true,
      uploadId: requestData.upload_id,
      confirmation,
      requestData,
    };
  }

  /**
   * Helper para sanitizar nombres de archivo
   */
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
      .substring(0, 255); // Limitar longitud
  }

  /**
   * Formatear bytes a tamaño legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();