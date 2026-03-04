// UploadComponent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DirectUploadManager, formatBytes, UploadValidationError } from './upload-manager';
import './UploadComponent.css'; // Opcional

const UploadComponent = ({ apiClient, maxFiles = 10 }) => {
  const [manager, setManager] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [quota, setQuota] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const uploadManager = new DirectUploadManager(apiClient, {
      maxConcurrentUploads: 3,
      onProgress: (progress) => {
        setUploads(prev => 
          prev.map(u => 
            u.id === progress.uploadId 
              ? { ...u, progress: progress.percent }
              : u
          )
        );
      },
      onComplete: (result) => {
        setUploads(prev => 
          prev.map(u => 
            u.id === result.uploadId 
              ? { ...u, status: 'completed', result }
              : u
          )
        );
        refreshQuota();
      },
      onError: (error) => {
        setUploads(prev => 
          prev.map(u => 
            u.id === error.uploadId 
              ? { ...u, status: 'failed', error: error.error }
              : u
          )
        );
      }
    });

    uploadManager.initialize().then(() => {
      setManager(uploadManager);
      setQuota(uploadManager.quota);
    });

    return () => {
      // Cleanup si es necesario
    };
  }, [apiClient]);

  const refreshQuota = useCallback(async () => {
    if (manager) {
      await manager.refreshQuota();
      setQuota(manager.quota);
    }
  }, [manager]);

  const handleFileSelect = async (files) => {
    if (!manager) return;

    const fileArray = Array.from(files);
    
    if (uploads.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const totalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
    if (!manager.hasEnoughQuota(totalSize)) {
      alert('Insufficient quota for selected files');
      return;
    }

    for (const file of fileArray) {
      const uploadId = await manager.uploadFile(file, {
        client_timestamp: Date.now(),
        source: 'web-uploader'
      });

      setUploads(prev => [...prev, {
        id: uploadId,
        file,
        status: 'queued',
        progress: 0,
        addedAt: Date.now()
      }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleCancel = async (uploadId) => {
    if (manager) {
      await manager.cancelUpload(uploadId, true);
      setUploads(prev => prev.filter(u => u.id !== uploadId));
    }
  };

  return (
    <div className="upload-container">
      {/* Quota Info */}
      {quota && (
        <div className="quota-info">
          <h3>Storage Quota</h3>
          <div className="quota-bar">
            <div 
              className="quota-used"
              style={{ width: `${(quota.used / quota.limit) * 100}%` }}
            />
            <div 
              className="quota-pending"
              style={{ width: `${(quota.pending / quota.limit) * 100}%` }}
            />
          </div>
          <div className="quota-stats">
            <span>Used: {formatBytes(quota.used)}</span>
            <span>Pending: {formatBytes(quota.pending)}</span>
            <span>Free: {formatBytes(quota.free)}</span>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        <p>Drag & drop files here or click to select</p>
      </div>

      {/* Upload List */}
      <div className="upload-list">
        {uploads.map(upload => (
          <div key={upload.id} className="upload-item">
            <div className="upload-info">
              <span className="file-name">{upload.file.name}</span>
              <span className="file-size">{formatBytes(upload.file.size)}</span>
              <span className={`status ${upload.status}`}>
                {upload.status}
              </span>
            </div>
            
            {upload.status === 'uploading' && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}

            {upload.status === 'failed' && (
              <div className="error-message">
                Error: {upload.error}
              </div>
            )}

            {['queued', 'uploading'].includes(upload.status) && (
              <button onClick={() => handleCancel(upload.id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Advanced Features */}
      <div className="upload-controls">
        <button onClick={refreshQuota}>
          Refresh Quota
        </button>
        
        <button onClick={() => manager?.processQueue()}>
          Process Queue
        </button>
        
        <span className="queue-stats">
          Active: {manager?.activeUploads.size || 0} | 
          Queued: {manager?.queue.filter(j => j.status === 'queued').length || 0}
        </span>
      </div>
    </div>
  );
};

export default UploadComponent;