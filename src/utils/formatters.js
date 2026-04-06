  // src/utils/formatters.js
  // ✅ Formateo de moneda, fechas y tipos de transacción
  // ✅ Listo para producción

  /**
   * Formatea un monto a moneda local (XAF)
   * @param {number|string} amount - Monto a formatear
   * @param {string} currency - Código de moneda (XAF, EUR, USD)
   * @returns {string} Monto formateado (ej: "1,500 XAF")
   */
  export const formatCurrency = (amount, currency = 'XAF') => {
    if (amount === undefined || amount === null) return `0 ${currency}`;
    
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return `0 ${currency}`;
    
    const formatted = Math.floor(num).toLocaleString('es-ES');
    return `${formatted} ${currency}`;
  };

  /**
   * Formatea un monto con signo (+/-)
   * @param {number|string} amount - Monto a formatear
   * @param {string} currency - Moneda
   * @returns {string} Monto con signo (ej: "+500 XAF" o "-200 XAF")
   */
  export const formatSignedCurrency = (amount, currency = 'XAF') => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return `0 ${currency}`;
    
    const sign = num >= 0 ? '+' : '-';
    const absValue = Math.abs(num);
    const formatted = Math.floor(absValue).toLocaleString('es-ES');
    return `${sign} ${formatted} ${currency}`;
  };

  /**
   * Formatea una fecha ISO a formato local
   * @param {string} dateString - Fecha ISO (ej: "2024-01-15T10:30:00Z")
   * @param {boolean} includeTime - Incluir hora
   * @returns {string} Fecha formateada (ej: "15/01/2024 10:30")
   */
  export const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (!includeTime) {
      return `${day}/${month}/${year}`;
    }
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  /**
   * Formatea el tipo de transacción a texto amigable
   * @param {string} type - Tipo de transacción
   * @returns {string} Texto amigable
   */
  export const formatTransactionType = (type) => {
    const types = {
      deposit: 'Recarga',
      purchase: 'Compra',
      refund: 'Reembolso',
      release: 'Liberación',
      withdrawal: 'Retiro',
      fee: 'Comisión',
      adjustment: 'Ajuste',
      gift_sent: 'Regalo enviado',
      gift_received: 'Regalo recibido'
    };
    return types[type] || type || 'Transacción';
  };

  /**
   * Formatea el estado de transacción a texto amigable
   * @param {string} status - Estado de la transacción
   * @returns {string} Texto amigable
   */
  export const formatTransactionStatus = (status) => {
    const statuses = {
      pending: 'Pendiente',
      completed: 'Completada',
      failed: 'Fallida',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada'
    };
    return statuses[status] || status || 'Desconocido';
  };

  /**
   * Abrevia un texto largo
   * @param {string} text - Texto a abreviar
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Texto abreviado
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Formatea duración en segundos a mm:ss
   * @param {number} seconds - Segundos
   * @returns {string} Duración formateada
   */
  export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };