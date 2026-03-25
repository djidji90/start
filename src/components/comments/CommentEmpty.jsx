// src/components/comments/CommentEmpty.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";

const CommentEmpty = ({ onWrite, isAuthenticated }) => {
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <ChatBubbleOutline sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
      <Typography variant="body1" color="text.secondary" gutterBottom>
        No hay comentarios aún
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isAuthenticated 
          ? "Sé el primero en comentar esta canción"
          : "Inicia sesión para dejar tu comentario"}
      </Typography>
      {isAuthenticated && (
        <Button variant="outlined" size="small" onClick={onWrite}>
          Escribir comentario
        </Button>
      )}
    </Box>
  );
};

export default CommentEmpty;