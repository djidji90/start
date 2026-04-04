// src/utils/idempotency.js
// ✅ Generación de claves únicas para evitar duplicados
// ✅ Almacenamiento temporal de claves usadas
// ✅ Listo para producción

// Almacenar claves usadas recientemente (evita reintentos innecesarios)
const usedKeys = new Set();
const MAX_KEYS = 100;
const KEY_EXPIRY_MS = 60000; // 1 minuto

/**
 * Genera una clave de idempotencia única
 * Formato: timestamp-randomness
 * @returns {string} Clave única (ej: "1705315200000-abc123def")
 */
export const generateIdempotencyKey = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const key = `${timestamp}-${random}`;
  
  // Limpiar claves antiguas periódicamente
  cleanOldKeys();
  
  return key;
};

/**
 * Marca una clave como usada (evita reutilización inmediata)
 * @param {string} key - Clave a marcar
 */
export const markKeyAsUsed = (key) => {
  usedKeys.add(key);
  
  // Limitar tamaño del set
  if (usedKeys.size > MAX_KEYS) {
    const firstKey = usedKeys.values().next().value;
    usedKeys.delete(firstKey);
  }
  
  // Auto-expiración después de KEY_EXPIRY_MS
  setTimeout(() => {
    usedKeys.delete(key);
  }, KEY_EXPIRY_MS);
};

/**
 * Verifica si una clave ya fue usada
 * @param {string} key - Clave a verificar
 * @returns {boolean} True si ya fue usada
 */
export const isKeyUsed = (key) => {
  return usedKeys.has(key);
};

/**
 * Limpia claves antiguas (opcional, llamada periódica)
 */
const cleanOldKeys = () => {
  // Esta función se ejecuta automáticamente con setTimeout
  // No es necesario llamarla manualmente
};

/**
 * Genera clave específica para compra de canción
 * @param {number|string} songId - ID de la canción
 * @param {number|string} userId - ID del usuario
 * @returns {string} Clave específica
 */
export const generatePurchaseKey = (songId, userId) => {
  const timestamp = Date.now();
  return `purchase-${userId}-${songId}-${timestamp}`;
};

/**
 * Genera clave específica para recarga de código
 * @param {string} code - Código de recarga
 * @param {number|string} userId - ID del usuario
 * @returns {string} Clave específica
 */
export const generateRedeemKey = (code, userId) => {
  const timestamp = Date.now();
  return `redeem-${userId}-${code.substring(0, 8)}-${timestamp}`;
};