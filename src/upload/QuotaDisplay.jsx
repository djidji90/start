// components/Upload/QuotaDisplay.jsx
import React, { useEffect } from 'react';

function QuotaDisplay({ quota, onRefresh, isLoading = false }) {
  useEffect(() => {
    // Cargar cuota al montar si no existe
    if (!quota && onRefresh) {
      onRefresh();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="quota-display">
        <div className="quota-header">
          <h3>Cuota de Almacenamiento</h3>
          <button className="btn-refresh" disabled>
            ↻
          </button>
        </div>
        <div className="quota-loading">Cargando...</div>
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="quota-display">
        <div className="quota-header">
          <h3>Cuota de Almacenamiento</h3>
          <button className="btn-refresh" onClick={onRefresh}>
            ↻
          </button>
        </div>
        <div className="quota-error">No se pudo cargar la cuota</div>
      </div>
    );
  }

  const percentage = Math.min(quota.quota_percentage, 100);
  const usedGB = (quota.used_quota / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (quota.total_quota / (1024 * 1024 * 1024)).toFixed(2);
  const availableGB = (quota.available_quota / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="quota-display">
      <div className="quota-header">
        <h3>Cuota de Almacenamiento</h3>
        <button className="btn-refresh" onClick={onRefresh} title="Actualizar">
          ↻
        </button>
      </div>

      <div className="quota-bar">
        <div 
          className="quota-used" 
          style={{ width: `${percentage}%` }}
          title={`${percentage.toFixed(1)}% usado`}
        />
      </div>

      <div className="quota-stats">
        <div className="stat">
          <span className="stat-label">Usado:</span>
          <span className="stat-value">{usedGB} GB</span>
        </div>
        <div className="stat">
          <span className="stat-label">Disponible:</span>
          <span className="stat-value">{availableGB} GB</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{totalGB} GB</span>
        </div>
      </div>

      <div className="quota-details">
        <p>Sesiones activas: {quota.active_sessions || 0}</p>
        <p>Reservado: {uploadService.formatBytes(quota.reserved_quota || 0)}</p>
      </div>

      <style jsx>{`
        .quota-display {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .quota-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .quota-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .btn-refresh {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }

        .btn-refresh:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn-refresh:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quota-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .quota-used {
          height: 100%;
          background: #4ade80;
          border-radius: 5px;
          transition: width 0.3s ease;
        }

        .quota-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .quota-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          opacity: 0.9;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 15px;
        }

        .quota-loading, .quota-error {
          text-align: center;
          padding: 20px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .quota-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .quota-details {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default QuotaDisplay;