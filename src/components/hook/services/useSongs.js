import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import songService from "../services/songService";
import { toast } from "react-toastify";

export const useSongs = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['songs', filters],
    queryFn: () => songService.getSongs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    ...options,
  });
};

export const useSong = (songId, options = {}) => {
  return useQuery({
    queryKey: ['song', songId],
    queryFn: () => songService.getSongById(songId),
    enabled: !!songId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    ...options,
  });
};

export const useUploadSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songData) => songService.uploadSong(songData),
    onSuccess: (data) => {
      toast.success("Canción subida exitosamente");
      queryClient.invalidateQueries(['songs']);
      queryClient.invalidateQueries(['user-songs']);
    },
    onError: (error) => {
      toast.error(`Error subiendo canción: ${error.message}`);
    },
  });
};

export const useLikeSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId) => songService.toggleLike(songId),
    onSuccess: (data, songId) => {
      // Actualizar cache optimísticamente
      queryClient.setQueryData(['song', songId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likes_count: data.likes_count,
          is_liked: !oldData.is_liked,
        };
      });
      
      // Invalidate queries relacionadas
      queryClient.invalidateQueries(['songs']);
      queryClient.invalidateQueries(['trending']);
    },
    onError: (error) => {
      toast.error(`Error procesando like: ${error.message}`);
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId) => songService.deleteSong(songId),
    onSuccess: (data, songId) => {
      toast.success("Canción eliminada correctamente");
      
      // Eliminar del cache
      queryClient.removeQueries(['song', songId]);
      queryClient.invalidateQueries(['songs']);
      queryClient.invalidateQueries(['user-songs']);
    },
    onError: (error) => {
      toast.error(`Error eliminando canción: ${error.message}`);
    },
  });
};

export const useRandomSongs = (limit = 15) => {
  return useQuery({
    queryKey: ['random-songs', limit],
    queryFn: () => songService.getRandomSongs(limit),
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};

export const useSearchSuggestions = (query) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => songService.getSearchSuggestions(query),
    enabled: query && query.length >= 2,
    staleTime: 1000 * 30, // 30 segundos
  });
};