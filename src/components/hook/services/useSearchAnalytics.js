// src/hooks/useSearchAnalytics.js
import { useEffect, useCallback } from 'react';

/**
 * Hook para tracking de analytics de búsqueda
 * Opcional pero recomendado para producción
 */

export const useSearchAnalytics = () => {
  const trackEvent = useCallback((eventName, data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${eventName}:`, data);
      return;
    }

    try {
      // Google Analytics (si está configurado)
      if (window.gtag) {
        window.gtag('event', eventName, {
          ...data,
          app_name: 'DjiMusic',
          timestamp: Date.now(),
        });
      }

      // Guardar localmente para batch processing
      const events = JSON.parse(localStorage.getItem('search_analytics') || '[]');
      events.push({
        event: eventName,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      });
      
      // Mantener solo últimos 100 eventos
      localStorage.setItem('search_analytics', JSON.stringify(events.slice(-100)));
      
    } catch (err) {
      console.debug('Analytics error:', err);
    }
  }, []);

  // Trackear eventos automáticamente
  const trackSearch = useCallback((query, resultsCount, source, duration) => {
    trackEvent('search', {
      query,
      results_count: resultsCount,
      source,
      duration_ms: duration,
      query_length: query.length
    });
  }, [trackEvent]);

  const trackSearchSelection = useCallback((item, type, query) => {
    trackEvent('search_selection', {
      item_type: type,
      item_id: item.id || item.name || 'unknown',
      query,
      item_title: item.title || item.name || 'unknown'
    });
  }, [trackEvent]);

  const trackSearchError = useCallback((query, error, attempt) => {
    trackEvent('search_error', {
      query,
      error_message: error.message?.substring(0, 100),
      error_code: error.code,
      attempt,
      online: navigator.onLine
    });
  }, [trackEvent]);

  // Subir analytics pendientes cuando haya conexión
  useEffect(() => {
    const uploadStoredAnalytics = () => {
      try {
        const events = JSON.parse(localStorage.getItem('search_analytics') || '[]');
        if (events.length === 0) return;

        // Aquí podrías enviar a tu backend
        console.log(`Subiendo ${events.length} eventos de analytics...`);
        
        // Simular envío
        // await fetch('/api/analytics/', { method: 'POST', body: JSON.stringify(events) });
        
        // Limpiar después de enviar
        localStorage.removeItem('search_analytics');
        
      } catch (err) {
        console.debug('Error uploading analytics:', err);
      }
    };

    window.addEventListener('online', uploadStoredAnalytics);
    
    // Subir al montar si hay conexión
    if (navigator.onLine) {
      uploadStoredAnalytics();
    }

    return () => {
      window.removeEventListener('online', uploadStoredAnalytics);
    };
  }, []);

  return {
    trackSearch,
    trackSearchSelection,
    trackSearchError,
    trackEvent
  };
};