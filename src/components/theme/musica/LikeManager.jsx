import React, { useState, useEffect } from 'react';
import { IconButton, CircularProgress, Tooltip, Snackbar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';
import { useConfig } from '../../hook/useConfig';

const LikeManager = ({ songId, initialLikes, initialLiked, onLikeUpdate }) => {
  const { api } = useConfig();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialLiked);
  }, [initialLikes, initialLiked]);

  const handleLike = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const newLikedState = !liked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;
      
      setLiked(newLikedState);
      setLikes(newLikesCount);
      onLikeUpdate?.(songId, newLikesCount, newLikedState);

      // API call
      await axios.post(
        `${api.baseURL}/api2/songs/${songId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
    } catch (error) {
      // Rollback on error
      setLiked(initialLiked);
      setLikes(initialLikes);
      onLikeUpdate?.(songId, initialLikes, initialLiked);
      
      const errorMessage = error.response?.status === 401
        ? 'Debes iniciar sesión para dar like'
        : 'Error al actualizar el like';
        
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-manager">
      <Tooltip title={error || (liked ? 'Quitar like' : 'Dar like')}>
        <span>
          <IconButton
            onClick={handleLike}
            disabled={loading}
            color={error ? 'error' : 'default'}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : liked ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <span>{likes}</span>
      
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        message={error}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </div>
  );
};

export default React.memo(LikeManager);