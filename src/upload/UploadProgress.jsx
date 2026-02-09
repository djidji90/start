// components/Upload/UploadProgress.jsx
import React from 'react';

function UploadProgress({ 
  fileName, 
  progress, 
  status, 
  fileSize,
  onCancel,
  uploadId 
}) {
  const getStatusText = () => {
    const statusMap = {
      preparing: 'Preparando...',
      uploading: 'Subiendo...',
      confirming: 'Confirmando...',
      processing: 'Procesando...',
      completed: 'Completado',
      error: 'Error',
      cancelled: 'Cancelado',
    };
    return statusMap[status] || 'En progreso';
  };

  const getStatusColor = () => {
    const colorMap = {
      preparing: '#f59e0b',
      uploading: '#3b82f6',
      confirming: '#8b5cf6',
      processing: '#f59e0b',
      completed: '#10b981',
      error: '#ef4444',
      cancelled: '#6b7280',
    };
    return colorMap[status] || '#3b82f6';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-progress">
      <div className="progress-header">
        <div className="file-info">
          <div className="file-name">{fileName}</div>
          <div className="file-size">{formatBytes(fileSize)}</div>
        </div>
        <div className="status-indicator" style={{ color: getStatusColor() }}>
          {getStatusText()}
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
        <div className="progress-text">{progress}%</div>
      </div>

      {status === 'uploading' && (
        <div className="progress-actions">
          <button 
            onClick={() => onCancel(uploadId)}
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      )}

      <style jsx>{`
        .upload-progress {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .status-indicator {
          font-weight: 600;
          font-size: 0.9rem;
          padding-left: 15px;
        }

        .progress-bar-container {
          margin-bottom: 15px;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: right;
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 600;
        }

        .progress-actions {
          display: flex;
          justify-content: flex-end;
        }

        .btn-cancel {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        @media (max-width: 640px) {
          .progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .status-indicator {
            padding-left: 0;
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default UploadProgress;