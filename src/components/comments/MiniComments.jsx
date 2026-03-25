// src/components/comments/MiniComments.jsx
import React, { useState, useCallback, memo } from "react";
import { Box, Typography, Skeleton, Dialog, IconButton, Tooltip } from "@mui/material";
import { ChatBubbleOutline, Close } from "@mui/icons-material";
import CommentSection from "./CommentSection";

const MiniComments = ({ songId, totalCount, isLoading }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpenDialog = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🔓 Abriendo diálogo para canción:', songId, 'totalCount:', totalCount);
    setDialogOpen(true);
  }, [songId, totalCount]);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  
  // Estado de carga
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={40} height={14} />
      </Box>
    );
  }
  
  // Siempre renderizar el mismo contenedor con onClick, solo cambia el contenido
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
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
          {totalCount > 0 ? `${totalCount} ${totalCount === 1 ? "comentario" : "comentarios"}` : "Comentar"}
        </Typography>
      </Box>
      
      {/* Diálogo con comentarios completos - SIEMPRE se abre al hacer clic */}
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