// src/components/hook/services/useSongComments.js
import { useState, useEffect, useCallback, useRef } from 'react';
import commentService from '../../../components/hook/services/commentService';

export const useSongComments = (songId) => {
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  const loadComments = useCallback(async () => {
    if (!songId) return;

    const cacheKey = `preview:${songId}`;
    const cached = cacheRef.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 120000) {
      setComments(cached.comments);
      setTotalCount(cached.totalCount);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await commentService.getComments(songId, {
        page: 1,
        pageSize: 2  // Solo 2 comentarios para preview
      });

      const previewComments = response.results || [];
      const count = response.count || 0;

      setComments(previewComments);
      setTotalCount(count);
      
      cacheRef.current.set(cacheKey, {
        comments: previewComments,
        totalCount: count,
        timestamp: Date.now()
      });
      
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    const handleCommentChange = (event) => {
      if (event.detail?.songId === songId) {
        loadComments();
      }
    };

    window.addEventListener('comment:created', handleCommentChange);
    window.addEventListener('comment:deleted', handleCommentChange);
    
    return () => {
      window.removeEventListener('comment:created', handleCommentChange);
      window.removeEventListener('comment:deleted', handleCommentChange);
    };
  }, [songId, loadComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    totalCount,
    isLoading,
    error,
    refresh: loadComments
  };
};

export default useSongComments;