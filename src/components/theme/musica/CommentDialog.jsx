import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  List,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfig } from '../../hook/useConfig';

const CommentDialog = ({ songId, open, onClose }) => {
  const { api } = useConfig();
  const [state, setState] = useState({
    comments: [],
    newComment: '',
    page: 1,
    totalPages: 1,
    loading: false,
    error: null
  });

  const normalizeComment = (c) => ({
    id: c?.id || Date.now(),
    user: c?.user?.username || c?.user || 'Usuario anónimo',
    content: c?.content || 'Sin contenido',
    date: new Date(c?.created_at || Date.now()),
    song: c?.song || songId,
    isOwner: c?.is_user_comment || false
  });

  const loadComments = async (page = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await axios.get(`${api.baseURL}/api2/songs/${songId}/comments/`, {
        params: { page },
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      });
      
      const results = res.data?.results?.map(comment => 
        normalizeComment({
          ...comment,
          user: comment.user?.username || comment.user
        })
      ) || [];

      setState(prev => ({
        ...prev,
        comments: page === 1 ? results : [...prev.comments, ...results],
        totalPages: Math.ceil((res.data?.count || 0) / 10),
        page,
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.detail || 'Error al cargar comentarios',
        loading: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = state.newComment.trim();
    if (!content || content.length < 3) {
      setState(prev => ({ ...prev, error: 'Mínimo 3 caracteres' }));
      return;
    }

    try {
      const res = await axios.post(
  `${api.baseURL}/api2/songs/${songId}/comments/`,
  { content, song: songId },
  { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
);


      setState(prev => ({
        ...prev,
        comments: [normalizeComment(res.data), ...prev.comments],
        newComment: '',
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.detail || 'Error al enviar comentario'
      }));
    }
  };

  useEffect(() => {
    if (open && songId) loadComments(1);
  }, [open, songId]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm" 
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          px: 3
        }}
      >
        <Typography variant="h6">💬 Comentarios</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: '#f9f9f9', p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            variant="outlined"
            label="Escribe un comentario..."
            value={state.newComment}
            onChange={(e) => setState(prev => ({
              ...prev,
              newComment: e.target.value,
              error: null
            }))}
            error={!!state.error}
            helperText={state.error || `${500 - state.newComment.length} caracteres restantes`}
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={state.newComment.trim().length < 3}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              🚀 Publicar
            </Button>
          </Box>
        </form>

        <List sx={{ mt: 3, maxHeight: '45vh', overflow: 'auto' }}>
          {state.comments.map((comment) => (
            <Fade in key={comment.id}>
              <Card sx={{ mb: 2, boxShadow: 2 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ 
                      bgcolor: comment.isOwner ? 'primary.main' : 'grey.500',
                      textTransform: 'uppercase'
                    }}>
                      {comment.user[0]?.toUpperCase() || 'U'}
                    </Avatar>
                  }
                  title={
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: 'text.secondary'
                      }}
                    >
                      @{comment.user}
                    </Typography>
                  }
                  subheader={formatDistanceToNow(comment.date, {
                    addSuffix: true,
                    locale: es
                  })}
                />
                <CardContent>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.4,
                      fontSize: '0.9rem'
                    }}
                  >
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          ))}

          {state.loading && <LinearProgress sx={{ mt: 2 }} />}

          {state.page < state.totalPages && !state.loading && (
            <Button
              onClick={() => loadComments(state.page + 1)}
              fullWidth
              variant="outlined"
              sx={{ 
                mt: 2, 
                borderRadius: 3,
                textTransform: 'none',
                color: 'text.secondary'
              }}
            >
              ▼ Cargar más comentarios ▼
            </Button>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(CommentDialog);