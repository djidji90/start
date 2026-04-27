// src/components/hook/services/playlistService.js
// ============================================
// 🎵 SERVICIO DE PLAYLISTS CURADAS
// ============================================
// Capa de acceso a la API — sin estado, sin efectos.
// Toda llamada usa la instancia `api` de apia.js,
// que ya maneja: auth headers, refresh token, rate limit e idempotency.

import { api } from "./apia"; // ✅ FIX: named export, consistente con el resto del proyecto

// ─── Endpoints ────────────────────────────────────────────────────────────────
const ENDPOINTS = {
  LIST:   "/api2/playlists/curated/",
  DETAIL: (slug)        => `/api2/playlists/curated/${slug}/`,
  STREAM: (slug)        => `/api2/playlists/curated/${slug}/stream/`,
  SAVE:   (id)          => `/api2/playlists/curated/${id}/save/`,
  SAVED:  "/api2/playlists/curated/my/saved/",
  ANALYTICS: (id)       => `/api2/playlists/curated/${id}/analytics/`,
};

// ─── Tipos de playlist válidos (espejo del backend) ───────────────────────────
export const PLAYLIST_TYPES = {
  FEATURED:    "featured",
  TEMPORAL:    "temporal",
  GENERICA:    "generica",
  NICHO:       "nicho",
  MOOD:        "mood",
  PROMOCIONAL: "promocional",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normaliza los parámetros de filtro antes de enviarlos a la API.
 * Evita mandar keys vacías o undefined que ensucian la query string.
 */
const buildListParams = ({ type, featured } = {}) => {
  const params = {};
  if (type && Object.values(PLAYLIST_TYPES).includes(type)) {
    params.type = type;
  }
  if (featured === true) {
    params.featured = "true";
  }
  return params;
};

// ─── Servicio ─────────────────────────────────────────────────────────────────

const playlistService = {

  /**
   * GET /api2/playlists/curated/
   * Devuelve { playlists, grouped, total, timestamp }
   *
   * @param {{ type?: string, featured?: boolean }} filters
   * @returns {Promise<{ playlists: Array, grouped: Object, total: number, timestamp: string }>}
   */
  async getAll(filters = {}) {
    const params = buildListParams(filters);
    const response = await api.get(ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * GET /api2/playlists/curated/<slug>/
   * Devuelve el detalle completo de una playlist + _metadata.
   *
   * @param {string} slug
   * @returns {Promise<Object>}
   */
  async getBySlug(slug) {
    if (!slug) throw new Error("playlistService.getBySlug: slug es requerido");
    const response = await api.get(ENDPOINTS.DETAIL(slug));
    return response.data;
  },

  /**
   * GET /api2/playlists/curated/<slug>/stream/
   * Devuelve las canciones con presigned URLs listas para reproducir.
   *
   * @param {string} slug
   * @returns {Promise<{ songs: Array, total_songs: number, total_duration: number, ... }>}
   */
  async getStream(slug) {
    if (!slug) throw new Error("playlistService.getStream: slug es requerido");
    const response = await api.get(ENDPOINTS.STREAM(slug));
    return response.data;
  },

  /**
   * POST /api2/playlists/curated/<id>/save/
   * Guarda una playlist en la biblioteca del usuario autenticado.
   *
   * @param {number|string} playlistId
   * @returns {Promise<{ success: boolean, action: string, message: string }>}
   */
  async save(playlistId) {
    if (!playlistId) throw new Error("playlistService.save: playlistId es requerido");
    const response = await api.post(ENDPOINTS.SAVE(playlistId));
    return response.data;
  },

  /**
   * DELETE /api2/playlists/curated/<id>/save/
   * Quita una playlist de la biblioteca del usuario autenticado.
   *
   * @param {number|string} playlistId
   * @returns {Promise<{ success: boolean, action: string }>}
   */
  async unsave(playlistId) {
    if (!playlistId) throw new Error("playlistService.unsave: playlistId es requerido");
    const response = await api.delete(ENDPOINTS.SAVE(playlistId));
    return response.data;
  },

  /**
   * GET /api2/playlists/curated/my/saved/
   * Lista las playlists guardadas por el usuario autenticado.
   *
   * @returns {Promise<Array>}
   */
  async getSaved() {
    const response = await api.get(ENDPOINTS.SAVED);
    return response.data;
  },

  /**
   * GET /api2/playlists/curated/<id>/analytics/  (solo staff)
   *
   * @param {number|string} playlistId
   * @returns {Promise<Object>}
   */
  async getAnalytics(playlistId) {
    if (!playlistId) throw new Error("playlistService.getAnalytics: playlistId es requerido");
    const response = await api.get(ENDPOINTS.ANALYTICS(playlistId));
    return response.data;
  },
};

export default playlistService;