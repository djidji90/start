// src/components/comments/MiniComments.jsx
import React, { useState, useCallback, memo } from "react";
import { Box, Typography, Avatar, Skeleton, Dialog, IconButton, Tooltip, Collapse } from "@mui/material";
import { ChatBubbleOutline, Close, ExpandMore, ExpandLess } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import CommentSection from "../comments/CommentSection";
import { useSongComments } from "../../components/hook/services/useSongComments";

const MiniComments = ({ songId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(true); // Estado para colapsar preview
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Solo cargar datos cuando se abre el diálogo o se expande el preview
  const { totalCount, comments, isLoading, refresh } = useSongComments(
    shouldLoad ? songId : null
  );
  
  const handleOpenDialog = useCallback((e) => {
    // No cerrar si se hizo clic en el botón de colapsar
    if (e.target.closest('.collapse-button')) {
      return;
    }
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
    // Si no está cargado, cargar datos al expandir
    if (!shouldLoad && !previewExpanded) {
      setShouldLoad(true);
    }
    setPreviewExpanded(prev => !prev);
  }, [shouldLoad, previewExpanded]);
  
  const safeComments = Array.isArray(comments) ? comments : [];
  const hasComments = totalCount > 0;
  const hasPreviewComments = safeComments.length > 0;
  
  // Estado de carga inicial (cuando se expande preview)
  if (isLoading && shouldLoad && previewExpanded && !hasPreviewComments) {
    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width="90%" height={30} />
        <Skeleton variant="text" width="70%" height={30} />
      </Box>
    );
  }
  
  // 🔥 CASO 1: Sin comentarios - solo icono + texto "Comentar"
  if (!hasComments) {
    return (
      <>
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
          <ChatBubbleOutline sx={{ fontSize: 12 }} />
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            Comentar
          </Typography>
        </Box>
        
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
  }
  
  // 🔥 CASO 2: Con comentarios - TODO el área es clickeable, con botón para colapsar preview
  return (
    <>
      {/* Contenedor principal - TODO CLICKEABLE excepto el botón de colapsar */}
      <Box sx={{ mt: 1 }}>
        {/* Header con contador y botón de colapsar */}
        <Box 
          onClick={handleOpenDialog}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            cursor: "pointer",
            py: 0.5,
            px: 0.5,
            borderRadius: 1,
            transition: "background-color 0.2s",
            "&:hover": { bgcolor: alpha("#000", 0.02) },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ChatBubbleOutline sx={{ fontSize: 12, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
              {totalCount} {totalCount === 1 ? "comentario" : "comentarios"}
            </Typography>
          </Box>
          
          {/* 🔥 Botón de colapsar/expandir - NO cierra el diálogo */}
          <IconButton 
            size="small" 
            onClick={togglePreview}
            className="collapse-button"
            sx={{ p: 0.25 }}
          >
            {previewExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        
        {/* Preview colapsable */}
        <Collapse in={previewExpanded}>
          <Box 
            onClick={handleOpenDialog}
            sx={{ 
              cursor: "pointer",
              pl: 1, 
              mt: 0.5,
              borderLeft: "2px solid",
              borderLeftColor: alpha("#9CA3AF", 0.3),
              transition: "all 0.2s",
              "&:hover": {
                borderLeftColor: "primary.main",
              },
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
                    bgcolor: alpha("#FF6B35", 0.2),
                    color: "#FF6B35",
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
                  <strong style={{ color: "#374151" }}>{comment.user?.username}:</strong> {comment.content}
                </Typography>
              </Box>
            ))}
            
            {/* Indicador de más comentarios */}
            {safeComments.length < totalCount && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: "0.55rem", 
                  color: "primary.main",
                  display: "inline-block",
                  mt: 0.25,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Ver {totalCount - safeComments.length} más...
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>
      
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




