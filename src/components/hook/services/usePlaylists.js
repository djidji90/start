// src/components/hook/services/usePlaylists.js
// ============================================
// 🎵 HOOK — PLAYLISTS CURADAS
// ============================================
// Maneja: fetch, estado, filtros en cliente y re-fetch.
// NO hace llamadas directas a axios — delega todo a playlistService.js
// Sigue el mismo patrón que useDiscovery.js y useArtists.js del proyecto.

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import playlistService, { PLAYLIST_TYPES } from "../../../components/hook/services/playlistService.";

// ─── Estado inicial ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  playlists:  [],   // array plano — toda la respuesta
  grouped:    {},   // agrupado por tipo: { featured: [], mood: [], ... }
  total:      0,
  timestamp:  null,
};

// ─── Hook principal ───────────────────────────────────────────────────────────

/**
 * usePlaylists
 *
 * @param {Object}  options
 * @param {string}  [options.type]       - Filtrar por tipo en la petición inicial (PLAYLIST_TYPES)
 * @param {boolean} [options.featured]   - Solo playlists destacadas
 * @param {boolean} [options.autoFetch]  - Lanzar fetch al montar (default: true)
 *
 * @returns {{
 *   playlists:       Array,
 *   grouped:         Object,
 *   featured:        Array,        // shortcut: grouped.featured
 *   total:           number,
 *   loading:         boolean,
 *   error:           string|null,
 *   activeFilter:    string|null,  // filtro activo en cliente
 *   filtered:        Array,        // playlists filtradas (sin nueva petición)
 *   fetch:           Function,     // lanzar petición con nuevos params
 *   filterByType:    Function,     // filtrar en cliente sin petición
 *   clearFilter:     Function,     // limpiar filtro cliente
 *   refresh:         Function,     // re-fetch con los mismos params
 * }}
 */
const usePlaylists = ({ type, featured, autoFetch = true } = {}) => {
  const [data, setData]         = useState(INITIAL_STATE);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // filtro solo en cliente

  // Ref para evitar actualizaciones en componente desmontado
  const mountedRef  = useRef(true);
  const fetchingRef = useRef(false); // ✅ FIX: ref para guard de fetch simultáneo (evita closure stale de `loading`)

  // Guardamos los últimos params para el refresh
  const lastParamsRef = useRef({ type, featured });

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPlaylists = useCallback(async (params = {}) => {
    // ✅ FIX: usar ref en lugar de `loading` (que en closure siempre leería el valor inicial)
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setError(null);
    lastParamsRef.current = params;

    try {
      const result = await playlistService.getAll(params);

      if (!mountedRef.current) return;

      setData({
        playlists: result.playlists  ?? [],
        grouped:   result.grouped    ?? {},
        total:     result.total      ?? 0,
        timestamp: result.timestamp  ?? null,
      });

      // Limpiar filtro cliente al recibir nuevos datos
      setActiveFilter(null);

    } catch (err) {
      if (!mountedRef.current) return;

      // Reutiliza el mensaje normalizado que pone el interceptor de apia.js
      const message = err.message || "Error al cargar playlists";
      setError(message);
      console.error("[usePlaylists] Error:", message);

    } finally {
      fetchingRef.current = false; // ✅ siempre liberar, independiente de si está montado
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // sin dependencias — params llegan por argumento

  // ─── Auto-fetch al montar ────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    if (autoFetch) {
      fetchPlaylists({ type, featured });
    }

    return () => {
      mountedRef.current = false;
    };
  }, []); // solo al montar — cambios de filtro van por `fetch()`

  // ─── Filtrado en cliente (sin nueva petición) ────────────────────────────────

  /**
   * Filtra el array ya cargado por tipo.
   * No dispara ninguna petición a la API.
   * @param {string} typeFilter - uno de PLAYLIST_TYPES
   */
  const filterByType = useCallback((typeFilter) => {
    if (!typeFilter || !Object.values(PLAYLIST_TYPES).includes(typeFilter)) {
      console.warn(`[usePlaylists] Tipo inválido: "${typeFilter}". Usa PLAYLIST_TYPES.`);
      return;
    }
    setActiveFilter(typeFilter);
  }, []);

  /**
   * Filtra solo las playlists destacadas del array ya cargado.
   */
  const filterFeatured = useCallback(() => {
    setActiveFilter("__featured__");
  }, []);

  /**
   * Limpia el filtro de cliente y vuelve a mostrar todas.
   */
  const clearFilter = useCallback(() => {
    setActiveFilter(null);
  }, []);

  // ─── Array filtrado (derivado, memoizado) ────────────────────────────────────

  const filtered = useMemo(() => {
    if (!activeFilter) return data.playlists;

    if (activeFilter === "__featured__") {
      return data.playlists.filter(p => p.featured);
    }

    return data.playlists.filter(p => p.playlist_type === activeFilter);
  }, [data.playlists, activeFilter]);

  // ─── Re-fetch con los mismos params ─────────────────────────────────────────

  const refresh = useCallback(() => {
    fetchPlaylists(lastParamsRef.current);
  }, [fetchPlaylists]);

  // ─── API pública del hook ────────────────────────────────────────────────────

  return {
    // Datos
    playlists:    data.playlists,
    grouped:      data.grouped,
    featured:     data.grouped?.featured ?? [],   // shortcut más cómodo
    total:        data.total,
    timestamp:    data.timestamp,

    // Estado
    loading,
    error,

    // Filtro cliente
    activeFilter,
    filtered,

    // Acciones
    fetch:        fetchPlaylists,
    filterByType,
    filterFeatured,
    clearFilter,
    refresh,
  };
};

export { PLAYLIST_TYPES };
export default usePlaylists;