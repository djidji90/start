// src/hooks/services/useLike.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = 'https://api.djidjimusic.com/api2';

// Cache de peticiones para evitar duplicados
const likesCache = new Map();

const fetchLikes = async (songId) => {
  // Verificar cache en memoria
  if (likesCache.has(songId)) {
    return likesCache.get(songId);
  }
  
  const { data } = await axios.get(`${API_BASE_URL}/songs/${songId}/likes/`);
  likesCache.set(songId, data);
  return data;
};

const toggleLike = async (songId, token) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/songs/${songId}/like/`,
    {},
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return data;
};

const useLike = (songId, initialLikes = 0, initialLiked = false) => {
  const queryClient = useQueryClient();
  const queryKey = ['likes', songId];
  const channelRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Estados ultra rápidos
  const [optimisticLiked, setOptimisticLiked] = useState(null);
  const [optimisticCount, setOptimisticCount] = useState(null);
  const [userLiked, setUserLiked] = useState(initialLiked);

  // Token
  const getToken = useCallback(() => {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  }, []);

  // ========================================== //
  // QUERY: Cache de 5 minutos
  // ========================================== //
  const { 
    data, 
    isLoading,
    error 
  } = useQuery({
    queryKey,
    queryFn: () => fetchLikes(songId),
    enabled: !!songId,
    staleTime: 5 * 60 * 1000,        // 5 minutos sin refetch
    cacheTime: 10 * 60 * 1000,       // 10 minutos en caché
    initialData: { likes_count: initialLikes },
    refetchOnWindowFocus: false,      // ❌ No recargar al enfocar ventana
    refetchOnReconnect: false,        // ❌ No recargar al reconectar
    retry: 1,                         // Solo 1 reintento
  });

  // ========================================== //
  // MUTATION: Optimistic + debounce
  // ========================================== //
  const { mutate, isLoading: isToggling } = useMutation({
    mutationFn: () => toggleLike(songId, getToken()),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistic update inmediato
      const newLiked = !(optimisticLiked ?? userLiked);
      const newCount = (data?.likes_count ?? initialLikes) + (newLiked ? 1 : -1);
      
      setOptimisticLiked(newLiked);
      setOptimisticCount(newCount);
      setUserLiked(newLiked);
      
      queryClient.setQueryData(queryKey, { likes_count: newCount });
      
      return { previousData };
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      setOptimisticLiked(null);
      setOptimisticCount(null);
      setUserLiked(!userLiked);
    },
    
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      setOptimisticLiked(null);
      setOptimisticCount(null);
      
      // Broadcast a otras pestañas
      channelRef.current?.postMessage({ type: 'LIKE_UPDATED', data });
      
      // Actualizar cache en memoria
      likesCache.set(songId, data);
    },
  });

  // ========================================== //
  // HANDLER CON DEBOUNCE (300ms)
  // ========================================== //
  const handleLike = useCallback(() => {
    const token = getToken();
    if (!token) return;

    // Cancelar petición anterior (debounce)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Optimistic update instantáneo
    const newLiked = !(optimisticLiked ?? userLiked);
    const newCount = (data?.likes_count ?? initialLikes) + (newLiked ? 1 : -1);
    
    setOptimisticLiked(newLiked);
    setOptimisticCount(newCount);
    setUserLiked(newLiked);
    
    // Petición real con debounce
    timeoutRef.current = setTimeout(() => {
      mutate();
      timeoutRef.current = null;
    }, 300); // 300ms de espera
    
  }, [data?.likes_count, initialLikes, userLiked, optimisticLiked, mutate, getToken]);

  // ========================================== //
  // BROADCAST CHANNEL (sincronización 0ms)
  // ========================================== //
  useEffect(() => {
    if (!songId) return;
    
    const channelName = `likes-${songId}`;
    channelRef.current = new BroadcastChannel(channelName);
    
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'LIKE_UPDATED') {
        queryClient.setQueryData(queryKey, event.data.data);
        setOptimisticLiked(null);
        setOptimisticCount(null);
        
        // Inferir si el usuario actual dio like (por el mensaje)
        if (event.data.data.message) {
          setUserLiked(event.data.data.message === 'Like agregado');
        }
      }
    };
    
    return () => {
      channelRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [songId, queryClient, queryKey]);

  // Valores a mostrar (optimistic > real)
  const displayLiked = optimisticLiked !== null ? optimisticLiked : userLiked;
  const displayCount = optimisticCount !== null ? optimisticCount : (data?.likes_count ?? initialLikes);

  // Formateador ultra rápido
  const formatLikes = useCallback((count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }, []);

  return {
    likesCount: displayCount,
    userLiked: displayLiked,
    isLoading,
    isToggling,
    error,
    handleLike,
    formatLikes,
  };
};

export default useLike;