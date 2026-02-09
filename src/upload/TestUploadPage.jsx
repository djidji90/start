// pages/TestUploadPage.jsx
import React from 'react';
import UploadButton from '../components/upload/UploadButton';
import uploadService from '../services/uploadService';

const TestUploadPage = () => {
  const handleUploadSuccess = (result) => {
    console.log('Upload completado:', result);
    // Aquí podrías redirigir o actualizar la lista de canciones
  };

  const handleTestConnection = async () => {
    try {
      const quota = await uploadService.getUserQuota();
      alert(`Cuota: ${Math.round(quota.remaining / 1024 / 1024)}MB disponibles`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎵 DJI Music - Test de Upload</h1>
      
      <div style={{ margin: '20px 0' }}>
        <button onClick={handleTestConnection}>
          Verificar Conexión y Cuota
        </button>
      </div>

      <div style={{ 
        border: '2px dashed #007bff', 
        padding: '40px', 
        borderRadius: '12px',
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <h3>Subir Nueva Canción</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Formatos: MP3, WAV, OGG, M4A, FLAC, WEBM, OPUS
          <br />
          Tamaño máximo: 100MB
        </p>
        
        <UploadButton 
          onUploadSuccess={handleUploadSuccess}
          metadata={{
            source: 'web_upload',
            uploader_version: '1.0.0',
          }}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>Debug Info</h3>
        <button onClick={() => uploadService.debug()}>
          Mostrar Info del Servicio
        </button>
        <button onClick={() => console.log(uploadService.getMetrics())}>
          Ver Métricas
        </button>
      </div>
    </div>
  );
};

export default TestUploadPage;