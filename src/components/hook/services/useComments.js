// src/hooks/useComments.js
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import commentService from '../../../components/hook/services/commentService';


// ============================================
// CONSTANTES
// ============================================
const DEFAULT_PAGE_SIZE = 10;

// ============================================
// HOOK PRINCIPAL
// ============================================
export const useComments = (songId, options = {}) => {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    autoLoad = true,
    initialPage = 1,
  } = options;

  // Estados
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 0,
    currentPage: initialPage,
    next: null,
    previous: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs
  const currentPageRef = useRef(initialPage);
  const songIdRef = useRef(songId);
  const abortControllerRef = useRef(null);

  // ============================================
  // FUNCIÓN: Cargar comentarios
  // ============================================
  const loadComments = useCallback(async (page, isLoadMore = false) => {
    if (!songId) return;

    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await commentService.getComments(songId, {
        page,
        pageSize,
      });

      setComments(prev => isLoadMore ? [...prev, ...response.results] : response.results);
      setPagination({
        count: response.count,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        next: response.next,
        previous: response.previous,
      });
      setHasMore(response.currentPage < response.totalPages);

      currentPageRef.current = page;

    } catch (err) {
      setError(err.message);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [songId, pageSize]);

  // ============================================
  // FUNCIÓN: Cargar primera página
  // ============================================
  const loadFirstPage = useCallback(() => {
    if (songId) {
      loadComments(1, false);
    }
  }, [songId, loadComments]);

  // ============================================
  // FUNCIÓN: Cargar más (paginación infinita)
  // ============================================
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    const nextPage = currentPageRef.current + 1;
    if (nextPage <= pagination.totalPages) {
      loadComments(nextPage, true);
    }
  }, [hasMore, isLoadingMore, isLoading, pagination.totalPages, loadComments]);

  // ============================================
  // FUNCIÓN: Recargar (refrescar)
  // ============================================
  const refresh = useCallback(() => {
    if (songId) {
      loadComments(1, false);
    }
  }, [songId, loadComments]);

  // ============================================
  // EFECTO: Carga inicial
  // ============================================
  useEffect(() => {
    if (autoLoad && songId) {
      loadComments(initialPage, false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [songId, autoLoad, initialPage, loadComments]);

  // ============================================
  // EFECTO: Limpiar al cambiar canción
  // ============================================
  useEffect(() => {
    if (songIdRef.current !== songId) {
      setComments([]);
      setPagination({
        count: 0,
        totalPages: 0,
        currentPage: initialPage,
        next: null,
        previous: null,
      });
      setError(null);
      setHasMore(true);
      currentPageRef.current = initialPage;
      songIdRef.current = songId;
    }
  }, [songId, initialPage]);

  // ============================================
  // API PÚBLICA
  // ============================================
  return {
    // Datos
    comments,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    
    // Acciones
    loadMore,
    refresh,
    loadFirstPage,
    
    // Utilidades
    isEmpty: comments.length === 0 && !isLoading && !error,
  };
};

// ============================================
// HOOK: Crear comentario
// ============================================
export const useCreateComment = (songId, onSuccess) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createComment = useCallback(async (content) => {
    if (!content?.trim()) {
      setError('El comentario no puede estar vacío');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newComment = await commentService.createComment(songId, content);
      
      // Disparar evento para actualizar lista
      window.dispatchEvent(new CustomEvent('comment:created', {
        detail: { songId, comment: newComment }
      }));
      
      if (onSuccess) {
        onSuccess(newComment);
      }
      
      return newComment;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [songId, onSuccess]);

  return {
    createComment,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

// ============================================
// HOOK: Actualizar comentario
// ============================================
export const useUpdateComment = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateComment = useCallback(async (commentId, content) => {
    if (!content?.trim()) {
      setError('El comentario no puede estar vacío');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedComment = await commentService.updateComment(commentId, content);
      
      window.dispatchEvent(new CustomEvent('comment:updated', {
        detail: { commentId, comment: updatedComment }
      }));
      
      if (onSuccess) {
        onSuccess(updatedComment);
      }
      
      return updatedComment;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return {
    updateComment,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

// ============================================
// HOOK: Eliminar comentario
// ============================================
export const useDeleteComment = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteComment = useCallback(async (commentId) => {
    setIsLoading(true);
    setError(null);

    try {
      await commentService.deleteComment(commentId);
      
      window.dispatchEvent(new CustomEvent('comment:deleted', {
        detail: { commentId }
      }));
      
      if (onSuccess) {
        onSuccess(commentId);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return {
    deleteComment,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};

// ============================================
// HOOK: Obtener usuario actual (para permisos)
// ============================================
export const useCurrentUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      
      if (userStr && token) {
        const userData = JSON.parse(userStr);
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || null,
          isAuthenticated: true,
        });
      } else {
        setUser({ isAuthenticated: false });
      }
    } catch {
      setUser({ isAuthenticated: false });
    }
  }, []);

  return user;
};

export default useComments;