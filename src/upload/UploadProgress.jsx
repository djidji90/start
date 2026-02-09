// components/UploadProgress.jsx
import React from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Play,
  Pause,
  FileMusic,
  UploadCloud
} from 'lucide-react';

const UploadProgress = ({ upload, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'uploading': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'uploading': return <Play className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      default: return <UploadCloud className="w-5 h-5" />;
    }
  };

  const formatFileName = (name) => {
    if (name.length > 30) {
      return name.substring(0, 15) + '...' + name.substring(name.length - 12);
    }
    return name;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSpeed = (speed) => {
    if (!speed) return '';
    if (speed < 1024) return `${speed.toFixed(0)} B/s`;
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`;
    return `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds < 0) return '';
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getTimeElapsed = () => {
    const elapsed = (Date.now() - upload.startTime) / 1000;
    if (elapsed < 60) return `${elapsed.toFixed(0)}s`;
    if (elapsed < 3600) return `${(elapsed / 60).toFixed(1)}m`;
    return `${(elapsed / 3600).toFixed(1)}h`;
  };

  return (
    <div className={`p-4 rounded-xl border ${getStatusColor(upload.status)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(upload.status).split(' ')[0].replace('text-', 'bg-')} ${getStatusColor(upload.status).split(' ')[0]}`}>
            {getStatusIcon(upload.status)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <FileMusic className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-800">
                {formatFileName(upload.name)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {formatFileSize(upload.size)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {upload.status === 'uploading' && upload.speed && (
            <span className="text-sm font-medium px-2 py-1 bg-white rounded">
              {formatSpeed(upload.speed)}
            </span>
          )}
          
          {upload.status !== 'completed' && upload.status !== 'error' && (
            <button
              onClick={onCancel}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cancelar upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            {upload.status === 'completed' ? 'Completado' : 
             upload.status === 'error' ? 'Error' : 
             `${upload.progress}%`}
          </span>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {getTimeElapsed()}
            {upload.estimatedRemaining && ` • ${formatTimeRemaining(upload.estimatedRemaining)} restante`}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              upload.status === 'completed' ? 'bg-green-500' :
              upload.status === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${upload.progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Status Message */}
      {upload.error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{upload.error}</span>
          </div>
        </div>
      )}
      
      {upload.status === 'completed' && upload.result && (
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">¡Upload exitoso!</span>
              {upload.result.song && (
                <div className="mt-1 text-green-600">
                  Canción procesada: {upload.result.song.title}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;