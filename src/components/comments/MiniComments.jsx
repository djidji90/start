// src/components/comments/MiniComments.jsx
import React, { useState, useCallback, memo } from "react";
import { Box, Typography, Avatar, Skeleton, Dialog, IconButton, Tooltip, Collapse } from "@mui/material";
import { ChatBubbleOutline, Close, ExpandMore, ExpandLess } from "@mui/icons-material";
import CommentSection from "../comments/CommentSection";
import { useSongComments } from "../../components/hook/services/useSongComments";

const MiniComments = ({ songId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(true); // 🔥 Estado para colapsar preview
  const [shouldLoad, setShouldLoad] = useState(false);
  
  const { totalCount, comments, isLoading, refresh } = useSongComments(
    shouldLoad ? songId : null
  );
  
  const handleOpenDialog = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setShouldLoad(true);
    setDialogOpen(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  const togglePreview = useCallback((e) => {
    e.stopPropagation();
    setPreviewExpanded(prev => !prev);
  }, []);
  
  // Estado de carga inicial
  if (isLoading && shouldLoad) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={40} height={14} />
      </Box>
    );
  }
  
  const safeComments = Array.isArray(comments) ? comments : [];
  const hasComments = totalCount > 0;
  const hasPreviewComments = safeComments.length > 0;
  
  return (
    <>
      {/* Contenedor principal del preview */}
      {hasComments && shouldLoad && (
        <Box sx={{ mt: 1 }}>
          {/* Header con contador y botón de colapsar */}
          <Box 
            onClick={togglePreview}
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              cursor: "pointer",
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ChatBubbleOutline sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
                {totalCount} {totalCount === 1 ? "comentario" : "comentarios"}
              </Typography>
            </Box>
            <IconButton size="small" sx={{ p: 0.25 }}>
              {previewExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          </Box>
          
          {/* Preview colapsable */}
          <Collapse in={previewExpanded}>
            <Box 
              sx={{ 
                pl: 1, 
                mt: 0.5,
                borderLeft: "2px solid",
                borderLeftColor: "divider",
              }}
            >
              {safeComments.slice(0, 2).map((comment) => (
                <Box 
                  key={comment.id} 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1, 
                    mb: 0.5,
                    overflow: "hidden",
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 18, 
                      height: 18, 
                      fontSize: "0.5rem", 
                      bgcolor: "primary.light",
                      color: "white",
                    }}
                    src={comment.user?.avatar}
                  >
                    {comment.user?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: "0.6rem",
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    <strong>{comment.user?.username}:</strong> {comment.content}
                  </Typography>
                </Box>
              ))}
              
              {safeComments.length < totalCount && (
                <Typography 
                  variant="caption" 
                  sx={{ fontSize: "0.55rem", color: "primary.main", cursor: "pointer" }}
                  onClick={handleOpenDialog}
                >
                  Ver {totalCount - safeComments.length} más...
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      )}
      
      {/* Solo el botón simple cuando no hay comentarios o aún no se cargaron */}
      {(!hasComments || !shouldLoad) && (
        <Box 
          onClick={handleOpenDialog}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 0.5, 
            mt: 1,
            cursor: "pointer",
            color: "text.secondary",
            transition: "color 0.2s",
            "&:hover": { color: "primary.main" },
          }}
        >
          <ChatBubbleOutline sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
            {totalCount > 0 ? totalCount : ""}
          </Typography>
        </Box>
      )}
      
      {/* Diálogo con comentarios completos */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "80vh",
            overflow: "hidden",
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}>
          <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
            Comentarios
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small" aria-label="close">
            <Close fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <CommentSection songId={songId} defaultExpanded={true} />
        </Box>
      </Dialog>
    </>
  );
};

export default memo(MiniComments);