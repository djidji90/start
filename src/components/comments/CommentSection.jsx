// src/components/comments/CommentSection.jsx
import React, { useState, useCallback } from "react";
import { Box, Typography, Button, Divider, Collapse, Alert } from "@mui/material";
import { ChatBubbleOutline, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useComments, useCreateComment } from "../../components/hook/services/useComments";
import { useAuth } from "../../components/hook/services/useAuth";
import CommentList from "../comments/CommentList";
import CommentForm from "../comments/CommentForm";
import CommentSkeleton from "../comments/CommentSkeleton";
import CommentEmpty from "../comments/CommentEmpty";

const CommentSection = ({ songId, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isAuthenticated, user } = useAuth();
  
  const {
    comments,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useComments(songId, { autoLoad: true });
  
  const { createComment, isLoading: isCreating } = useCreateComment(songId, (newComment) => {
    setTimeout(() => {
      const element = document.getElementById(`comment-${newComment.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  });
  
  const handleSubmit = useCallback(async (content) => {
    await createComment(content);
  }, [createComment]);
  
  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);
  
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  const handleWriteClick = useCallback(() => {
    setExpanded(true);
    // Scroll al formulario
    setTimeout(() => {
      const form = document.querySelector('.comment-form');
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        const textarea = form.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    }, 100);
  }, []);
  
  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box 
        onClick={toggleExpanded}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          cursor: "pointer",
          py: 1,
          px: 1.5,
          borderRadius: 1,
          "&:hover": { bgcolor: "action.hover" },
          transition: "background-color 0.2s",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ChatBubbleOutline sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" fontWeight={500}>
            Comentarios
          </Typography>
          {pagination.count > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: "action.selected", 
                px: 0.75, 
                py: 0.25, 
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {pagination.count}
            </Typography>
          )}
        </Box>
        <Button size="small" sx={{ minWidth: "auto", p: 0.5 }}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </Button>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Collapse in={expanded}>
        <Box sx={{ pt: 1 }}>
          {/* Formulario para usuarios autenticados */}
          {isAuthenticated && (
            <CommentForm
              onSubmit={handleSubmit}
              isLoading={isCreating}
              placeholder="Escribe un comentario..."
            />
          )}
          
          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2, 
                fontSize: "0.8rem",
                "& .MuiAlert-icon": { alignItems: "center" },
              }}
            >
              Inicia sesión para comentar
            </Alert>
          )}
          
          {/* Estado de error */}
          {error && comments.length === 0 && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Reintentar
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}
          
          {/* Lista de comentarios */}
          {isLoading ? (
            <CommentSkeleton count={3} />
          ) : comments.length === 0 ? (
            <CommentEmpty 
              onWrite={handleWriteClick} 
              isAuthenticated={isAuthenticated} 
            />
          ) : (
            <>
              <CommentList 
                comments={comments}
                songId={songId}
                onCommentDeleted={refresh}
              />
              
              {/* Botón cargar más */}
              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "none" }}
                  >
                    {isLoadingMore ? "Cargando..." : "Cargar más comentarios"}
                  </Button>
                </Box>
              )}
              
              {/* Mensaje de fin */}
              {!hasMore && comments.length > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: "block", 
                    textAlign: "center", 
                    mt: 2, 
                    color: "text.disabled",
                    fontSize: "0.7rem",
                  }}
                >
                  No hay más comentarios
                </Typography>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(CommentSection);