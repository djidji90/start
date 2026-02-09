// components/FileValidator.jsx
import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Music, 
  X,
  FileText
} from 'lucide-react';

const FileValidator = ({ fileData, onRemove }) => {
  const { file, validation } = fileData;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp3':
      case 'm4a':
      case 'aac':
        return <Music className="w-5 h-5 text-blue-500" />;
      case 'wav':
      case 'flac':
      case 'aiff':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'ogg':
      case 'webm':
      case 'opus':
        return <Music className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const truncateFileName = (name) => {
    if (name.length > 25) {
      return name.substring(0, 12) + '...' + name.substring(name.length - 10);
    }
    return name;
  };

  return (
    <div className={`p-3 rounded-lg border ${
      validation.valid 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {getFileIcon()}
          <div>
            <div className="font-medium text-gray-800">
              {truncateFileName(file.name)}
            </div>
            <div className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {file.type || 'Tipo desconocido'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {validation.valid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600">
                  {error}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {validation.warnings.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileValidator;