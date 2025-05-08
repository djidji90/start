import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Typography,
  IconButton,
  Avatar,
  Box,
  Alert
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

  const normalizeComment = (apiComment) => ({
    id: apiComment?.id || Date.now(),
    user: apiComment?.user || 'Usuario anónimo',
    content: apiComment?.content || 'Contenido no disponible',
    date: new Date(apiComment?.created_at || Date.now()),
    song: apiComment?.song || songId,
    isOwner: apiComment?.is_user_comment || false
  });

  const loadComments = async (page = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await axios.get(
        `${api.baseURL}/api2/songs/${songId}/comments/`,
        {
          params: { page },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        }
      );

      const results = response.data?.results?.map(normalizeComment) || [];
      
      setState(prev => ({
        ...prev,
        comments: page === 1 ? results : [...prev.comments, ...results],
        totalPages: Math.ceil((response.data?.count || 0) / 10),
        page,
        loading: false
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.detail || 'Error cargando comentarios',
        loading: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const commentContent = (state.newComment || '').trim();
    
    if (!commentContent) {
      setState(prev => ({ ...prev, error: 'El comentario no puede estar vacío' }));
      return;
    }
    
    if (commentContent.length < 3) {
      setState(prev => ({ ...prev, error: 'Mínimo 3 caracteres' }));
      return;
    }

    try {
      const response = await axios.post(
        `${api.baseURL}/api2/songs/${songId}/comments/`,
        {
          content: commentContent,
          song: songId // Campo requerido añadido
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setState(prev => ({
        ...prev,
        comments: [normalizeComment(response.data), ...prev.comments],
        newComment: '',
        error: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.detail || 
             JSON.stringify(error.response?.data) || 
             'Error al publicar comentario'
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
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6">Comentarios</Typography>
        <IconButton onClick={onClose} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            value={state.newComment}
            onChange={(e) => setState(prev => ({
              ...prev,
              newComment: e.target.value,
              error: null
            }))}
            label="Escribe tu comentario..."
            variant="outlined"
            error={!!state.error}
            helperText={state.error || `${500 - state.newComment.length} caracteres restantes`}
            inputProps={{ 
              maxLength: 500,
              'aria-label': 'Campo para escribir comentario'
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={state.newComment.trim().length < 3}
              sx={{ borderRadius: 2 }}
            >
              Publicar
            </Button>
          </Box>
        </form>

        <List sx={{ mt: 2, maxHeight: '50vh', overflow: 'auto' }}>
          {state.comments.map((comment) => (
            <ListItem 
              key={comment.id} 
              alignItems="flex-start"
              sx={{ 
                py: 2,
                '&:not(:last-child)': {
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: comment.isOwner ? 'primary.main' : 'grey.500',
                  mr: 2,
                  width: 40,
                  height: 40
                }}
              >
                {comment.user[0]?.toUpperCase() || 'U'}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography 
                      variant="subtitle2" 
                      component="span"
                      sx={{ fontWeight: 600, mr: 1 }}
                    >
                      {comment.user}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                    >
                      {formatDistanceToNow(comment.date, { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      pt: 1
                    }}
                  >
                    {comment.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          
          {state.loading && <LinearProgress sx={{ my: 2 }} />}
          
          {state.page < state.totalPages && (
            <Button
              fullWidth
              onClick={() => loadComments(state.page + 1)}
              disabled={state.loading}
              sx={{ mt: 2 }}
            >
              Cargar más comentarios
            </Button>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(CommentDialog);