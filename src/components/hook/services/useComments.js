import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import commentService from "../services/commentService";
import { toast } from "react-toastify";

export const useComments = (songId, page = 1) => {
  return useQuery({
    queryKey: ['comments', songId, page],
    queryFn: () => commentService.getComments(songId, page),
    enabled: !!songId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ songId, content }) => 
      commentService.createComment(songId, content),
    onSuccess: (data, variables) => {
      toast.success("Comentario publicado");
      
      // Invalidate comments para esa canción
      queryClient.invalidateQueries(['comments', variables.songId]);
      
      // Actualizar contador de comentarios en cache de canción
      queryClient.setQueryData(['song', variables.songId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comments_count: (oldData.comments_count || 0) + 1,
        };
      });
    },
    onError: (error) => {
      toast.error(`Error publicando comentario: ${error.message}`);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, songId }) => 
      commentService.deleteComment(commentId),
    onSuccess: (data, variables) => {
      toast.success("Comentario eliminado");
      
      // Invalidate comments para esa canción
      queryClient.invalidateQueries(['comments', variables.songId]);
      
      // Actualizar contador de comentarios en cache de canción
      queryClient.setQueryData(['song', variables.songId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comments_count: Math.max(0, (oldData.comments_count || 1) - 1),
        };
      });
    },
    onError: (error) => {
      toast.error(`Error eliminando comentario: ${error.message}`);
    },
  });
};