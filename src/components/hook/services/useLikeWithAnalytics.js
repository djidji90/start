// src/components/hook/services/useLikeWithAnalytics.js
import useLike from './useLike';
import { useAnalytics } from './useAnalytics';

const useLikeWithAnalytics = (songId) => {
  const like = useLike(songId);
  const analytics = useAnalytics();
  
  const handleLike = useCallback(() => {
    const wasLiked = like.userLiked;
    
    // Tracking antes de la acción
    analytics.track('like_click', {
      song_id: songId,
      action: wasLiked ? 'unlike' : 'like',
      timestamp: Date.now()
    });
    
    // Ejecutar like
    like.handleLike();
    
    // Tracking después (opcional)
    setTimeout(() => {
      analytics.track('like_completed', {
        song_id: songId,
        success: !like.error
      });
    }, 1000);
    
  }, [like, analytics, songId]);
  
  return {
    ...like,
    handleLike
  };
};