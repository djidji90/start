// components/UploadQueue.jsx
import React from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  List, 
  Clock,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';

const UploadQueue = ({ 
  queue, 
  onStartQueue, 
  onPauseQueue, 
  onClearQueue,
  onRemoveFromQueue,
  onToggleSelection,
  selectedItems = [],
  isProcessing = false 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return queue.reduce((total, item) => total + (item.file?.size || 0), 0);
  };

  const getTotalFiles = () => {
    return queue.length;
  };

  const getSelectedCount = () => {
    return selectedItems.length;
  };

  const getSelectedSize = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = queue.find(q => q.id === itemId);
      return total + (item?.file?.size || 0);
    }, 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === queue.length) {
      onToggleSelection([]);
    } else {
      onToggleSelection(queue.map(item => item.id));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <List className="w-6 h-6 text-gray-700" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Cola de Uploads</h2>
            <p className="text-sm text-gray-500">
              {getTotalFiles()} archivos • {formatFileSize(getTotalSize())}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {queue.length > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title={selectedItems.length === queue.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              >
                {selectedItems.length === queue.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              
              {selectedItems.length > 0 && (
                <button
                  onClick={() => selectedItems.forEach(id => onRemoveFromQueue(id))}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Eliminar seleccionados"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClearQueue}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Limpiar cola"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              {isProcessing ? (
                <button
                  onClick={onPauseQueue}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium flex items-center"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </button>
              ) : (
                <button
                  onClick={onStartQueue}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium flex items-center"
                  disabled={queue.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Uploads
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {selectedItems.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              {getSelectedCount()} archivo(s) seleccionado(s) • {formatFileSize(getSelectedSize())}
            </span>
            <button
              onClick={() => selectedItems.forEach(id => onRemoveFromQueue(id))}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Eliminar seleccionados
            </button>
          </div>
        </div>
      )}
      
      {queue.length === 0 ? (
        <div className="text-center py-12">
          <List className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Cola vacía</h3>
          <p className="text-gray-400">
            Arrastra archivos aquí o selecciónalos para añadirlos a la cola
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                selectedItems.includes(item.id)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleSelection(item.id)}
                  className="text-gray-400 hover:text-blue-600"
                >
                  {selectedItems.includes(item.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                
                <div>
                  <div className="font-medium text-gray-800">
                    {item.file?.name || 'Archivo sin nombre'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-3">
                    <span>{formatFileSize(item.file?.size || 0)}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      En cola
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {item.error && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" title={item.error} />
                )}
                
                <button
                  onClick={() => onRemoveFromQueue(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  title="Eliminar de la cola"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {queue.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{getTotalFiles()} archivos</span>
              <span className="ml-2">({formatFileSize(getTotalSize())})</span>
            </div>
            
            <div>
              <span className="font-medium">Tiempo estimado: </span>
              <span>
                {getTotalFiles() <= 3 ? '5-10 minutos' :
                 getTotalFiles() <= 10 ? '15-30 minutos' :
                 getTotalFiles() <= 20 ? '30-60 minutos' :
                 'Más de 1 hora'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadQueue;