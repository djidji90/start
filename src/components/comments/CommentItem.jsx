// src/components/comments/CommentItem.jsx
import React, { useState, useCallback, memo } from "react";
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Tooltip } from "@mui/material";
import { MoreVert, Edit, Delete, AccessTime } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useUpdateComment, useDeleteComment } from "../../components/hook/services/useComments";
import CommentForm from "../comments/CommentForm";

const CommentItem = ({ comment, songId, onDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { updateComment, isLoading: isUpdating } = useUpdateComment();
  const { deleteComment, isLoading: isDeleting } = useDeleteComment();
  
  const isOwner = true; // Temporal: determinar con auth después
  
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    handleMenuClose();
  }, []);
  
  const handleEditSubmit = useCallback(async (content) => {
    await updateComment(comment.id, content);
    setIsEditing(false);
  }, [comment.id, updateComment]);
  
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);
  
  const handleDeleteClick = useCallback(() => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  }, []);
  
  const handleDeleteConfirm = useCallback(async () => {
    await deleteComment(comment.id, songId);
    setDeleteDialogOpen(false);
    if (onDeleted) onDeleted(comment.id);
  }, [comment.id, deleteComment, songId, onDeleted]);
  
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: es,
  });
  
  return (
    <>
      <Box 
        sx={{ 
          display: "flex", 
          gap: 1.5, 
          p: 1.5,
          borderRadius: 2,
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {/* Avatar */}
        <Avatar 
          src={comment.user?.avatar}
          sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
        >
          {comment.user?.username?.[0]?.toUpperCase() || "U"}
        </Avatar>
        
        {/* Contenido */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {comment.user?.username || "Usuario"}
            </Typography>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                {timeAgo}
              </Typography>
            </Box>
            
            {comment.isEdited && (
              <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.65rem", fontStyle: "italic" }}>
                (editado)
              </Typography>
            )}
          </Box>
          
          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={handleEditSubmit}
              onCancel={handleCancelEdit}
              isLoading={isUpdating}
              isEditing
            />
          ) : (
            <Typography variant="body2" sx={{ color: "text.primary", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {comment.content}
            </Typography>
          )}
        </Box>
        
        {/* Menú de acciones */}
        {!isEditing && (
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ alignSelf: "flex-start", opacity: 0.6, "&:hover": { opacity: 1 } }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEdit} disabled={isDeleting}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} disabled={isDeleting} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
      
      {/* Diálogo de confirmación */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Eliminar comentario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(CommentItem);