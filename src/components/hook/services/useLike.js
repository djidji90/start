// src/components/hook/services/useLike.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://api.djidjimusic.com/api2';

// ============================================
// FUNCIONES API
// ============================================

const fetchLikes = async (songId) => {
  const { data } = await axios.get(`${API_BASE_URL}/songs/${songId}/likes/`);
  return data;
};

const toggleLike = async (songId, token) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/songs/${songId}/like/`,
    {},
    { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  return data;
};

// ============================================
// HOOK PRINCIPAL - VERSIÓN CORREGIDA
// ============================================

/**
 * Hook profesional para manejo de likes
 * @param {number|string} songId - ID de la canción
 * @param {number} initialLikes - Likes iniciales del backend (song.likes_count)
 * @param {boolean} initialLiked - Si el usuario ya dio like (song.is_liked)
 */
const useLike = (songId, initialLikes = 0, initialLiked = false) => {
  const queryClient = useQueryClient();
  const queryKey = ['likes', songId];
  
  // Estados locales con valores iniciales del backend
  const [optimisticLiked, setOptimisticLiked] = useState(null);
  const [optimisticCount, setOptimisticCount] = useState(null);
  const [userLiked, setUserLiked] = useState(initialLiked); // ✅ Usar initialLiked
  
  // Refs para debounce y broadcast
  const timeoutRef = useRef(null);
  const channelRef = useRef(null);

  // ============================================
  // OBTENER TOKEN
  // ============================================
  const getToken = useCallback(() => {
    return localStorage.getItem('accessToken') || 
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('accessToken') ||
           sessionStorage.getItem('access_token');
  }, []);

  // ============================================
  // QUERY: OBTENER LIKES (CON CACHÉ)
  // ============================================
  const { 
    data, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: () => fetchLikes(songId),
    enabled: !!songId,
    staleTime: 5 * 60 * 1000, // 5 minutos en caché
    cacheTime: 10 * 60 * 1000, // 10 minutos en disco
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    // ✅ Usar initialLikes mientras carga
    initialData: { likes_count: initialLikes },
  });

  // ============================================
  // MUTATION: TOGGLE LIKE
  // ============================================
  const { mutate, isLoading: isToggling } = useMutation({
    mutationFn: () => toggleLike(songId, getToken()),
    
    // OPTIMISTIC UPDATE INMEDIATO
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        likes_count: (old?.likes_count ?? initialLikes) + (userLiked ? -1 : 1),
      }));
      
      return { previousData };
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      setOptimisticLiked(null);
      setOptimisticCount(null);
      setUserLiked(!userLiked);
      console.error('Error en like:', err);
    },
    
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      setOptimisticLiked(null);
      setOptimisticCount(null);
      setUserLiked(data.message === 'Like agregado');
      broadcastLikeUpdate(data);
    },
  });

  // ============================================
  // BROADCAST CHANNEL
  // ============================================
  const broadcastLikeUpdate = useCallback((data) => {
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage({
        type: 'LIKE_UPDATED',
        data: data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.log('Broadcast no soportado:', error);
    }
  }, []);

  useEffect(() => {
    if (!songId) return;
    
    const channelName = `likes-${songId}`;
    channelRef.current = new BroadcastChannel(channelName);
    
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'LIKE_UPDATED') {
        queryClient.setQueryData(queryKey, event.data.data);
        setOptimisticLiked(null);
        setOptimisticCount(null);
        setUserLiked(event.data.data.message === 'Like agregado');
      }
    };
    
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [songId, queryClient, queryKey]);

  // ============================================
  // HANDLER CON DEBOUNCE
  // ============================================
  const handleLike = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.warn('Usuario no autenticado');
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const newLikedState = !userLiked;
    const currentLikes = data?.likes_count ?? initialLikes;
    const newCount = currentLikes + (newLikedState ? 1 : -1);
    
    setUserLiked(newLikedState);
    setOptimisticLiked(newLikedState);
    setOptimisticCount(newCount);
    
    timeoutRef.current = setTimeout(() => {
      mutate();
      timeoutRef.current = null;
    }, 300);
    
  }, [userLiked, data?.likes_count, initialLikes, mutate, getToken]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // VALORES A MOSTRAR
  // ============================================
  const displayLikesCount = optimisticCount !== null 
    ? optimisticCount 
    : (data?.likes_count ?? initialLikes); // ✅ Usar initialLikes como fallback
    
  const displayUserLiked = optimisticLiked !== null 
    ? optimisticLiked 
    : userLiked;

  // ============================================
  // FORMATO DE NÚMEROS
  // ============================================
  const formatLikes = useCallback((count) => {
    if (!count && count !== 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }, []);

  return {
    likesCount: displayLikesCount,
    userLiked: displayUserLiked,
    isLoading,
    isToggling,
    error: queryError,
    handleLike,
    refetch,
    formatLikes,
    rawData: data,
  };
};

export default useLike;