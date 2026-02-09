// pages/UploadPage.jsx
import React from 'react';
import FileUploader from '../components/Upload/FileUploader';

function UploadPage() {
  return (
    <div className="upload-page">
      <header className="page-header">
        <h1>Subir Música</h1>
        <p className="page-subtitle">
          Comparte tu música con la comunidad DJ
        </p>
      </header>

      <main className="page-content">
        <FileUploader />
      </main>

      <style jsx>{`
        .upload-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
        }

        .page-header h1 {
          font-size: 3rem;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .page-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 20px 0;
          }

          .page-header h1 {
            font-size: 2.5rem;
          }

          .upload-page {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default UploadPage;