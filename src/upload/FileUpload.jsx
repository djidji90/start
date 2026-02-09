// components/FileUpload.jsx
import React, { useState } from 'react';
import { uploadService } from '../services/upload';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);

  // Cargar cuota al iniciar
  React.useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const data = await uploadService.getQuota();
      setQuota(data);
    } catch (err) {
      console.error('Error cargando cuota:', err);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validación básica
    if (quota && selectedFile.size > quota.available_quota) {
      setError(`Archivo muy grande. Disponible: ${formatBytes(quota.available_quota)}`);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const result = await uploadService.uploadFile(file, (p) => {
      setProgress(p);
    });

    setUploading(false);

    if (result.success) {
      setStatus({
        message: '¡Archivo subido exitosamente!',
        uploadId: result.uploadId,
      });
      setFile(null);
      setProgress(0);
      // Recargar cuota
      await loadQuota();
    } else {
      setError(result.error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <h2>Subir Archivo</h2>
      
      {/* Panel de Cuota */}
      {quota && (
        <div className="quota-panel">
          <div className="quota-info">
            <span>Espacio usado: {formatBytes(quota.used_quota)}</span>
            <span>Disponible: {formatBytes(quota.available_quota)}</span>
          </div>
          <div className="quota-bar">
            <div 
              className="quota-used" 
              style={{ width: `${Math.min(quota.quota_percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Selector de Archivos */}
      <div className="file-selector">
        <input
          type="file"
          id="file-input"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        {file && (
          <div className="file-info">
            <strong>{file.name}</strong>
            <span>{formatBytes(file.size)}</span>
            {!uploading && (
              <button 
                onClick={() => setFile(null)}
                className="btn-remove"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botón de Upload */}
      {file && !uploading && (
        <button 
          onClick={handleUpload}
          className="btn-upload"
          disabled={uploading}
        >
          Subir Archivo
        </button>
      )}

      {/* Barra de Progreso */}
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {/* Mensajes de Estado */}
      {status && (
        <div className="status-success">
          <p>{status.message}</p>
          {status.uploadId && (
            <small>ID: {status.uploadId.substring(0, 8)}...</small>
          )}
        </div>
      )}

      {/* Mensajes de Error */}
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}

      {/* Estilos inline simples */}
      <style>{`
        .upload-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .quota-panel {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .quota-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: #666;
        }
        
        .quota-bar {
          height: 10px;
          background: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .quota-used {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s;
        }
        
        .file-selector {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin-bottom: 20px;
          cursor: pointer;
        }
        
        .file-selector:hover {
          border-color: #4CAF50;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #e8f5e9;
          padding: 10px 15px;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .btn-upload, .btn-remove {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          display: block;
          width: 100%;
          margin-top: 10px;
        }
        
        .btn-upload:hover:not(:disabled) {
          background: #388E3C;
        }
        
        .btn-upload:disabled {
          background: #a5d6a7;
          cursor: not-allowed;
        }
        
        .btn-remove {
          background: #ff5252;
          width: auto;
          padding: 5px 10px;
        }
        
        .progress-container {
          margin-top: 20px;
        }
        
        .progress-bar {
          height: 20px;
          background: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s;
        }
        
        .progress-text {
          text-align: center;
          display: block;
          font-weight: bold;
        }
        
        .status-success {
          background: #e8f5e9;
          border: 1px solid #4CAF50;
          color: #2e7d32;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
        }
        
        .error-message {
          background: #ffebee;
          border: 1px solid #ff5252;
          color: #c62828;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
        }
        
        #file-input {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default FileUpload;