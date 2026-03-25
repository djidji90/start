// src/components/comments/CommentForm.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, TextField, Button, CircularProgress, Typography } from "@mui/material";
import { Send } from "@mui/icons-material";

const MAX_LENGTH = 1000;

const CommentForm = ({
  onSubmit,
  onCancel,
  initialContent = "",
  isLoading = false,
  placeholder = "Escribe un comentario...",
  autoFocus = true,
  isEditing = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const isValid = content.trim().length > 0 && !isOverLimit;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (isEditing) {
        inputRef.current.select();
      }
    }
  }, [autoFocus, isEditing]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    const trimmed = content.trim();
    if (!trimmed) {
      setError("El comentario no puede estar vacío");
      return;
    }
    
    if (trimmed.length > MAX_LENGTH) {
      setError(`El comentario no puede exceder los ${MAX_LENGTH} caracteres`);
      return;
    }
    
    setError(null);
    
    try {
      await onSubmit(trimmed);
      setContent("");
    } catch (err) {
      setError(err.message);
    }
  }, [content, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  }, [handleSubmit, onCancel]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      setContent(newValue);
      if (error) setError(null);
    }
  }, [error]);

  const getCounterColor = () => {
    if (isOverLimit) return "error.main";
    if (remainingChars <= 100) return "warning.main";
    return "text.secondary";
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField
        inputRef={inputRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={isLoading}
        error={!!error}
        helperText={error}
        multiline
        rows={isEditing ? 3 : 2}
        fullWidth
        variant="outlined"
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: "background.paper",
            transition: "all 0.2s",
            "&.Mui-focused": {
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
            },
          },
        }}
      />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: getCounterColor(),
            fontSize: "0.7rem",
            transition: "color 0.2s",
          }}
        >
          {remainingChars} caracteres restantes
          {isOverLimit && " (límite excedido)"}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={isLoading}
              size="small"
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            size="small"
            variant="contained"
            endIcon={isLoading ? <CircularProgress size={16} /> : <Send fontSize="small" />}
            sx={{ 
              textTransform: "none",
              minWidth: 80,
            }}
          >
            {isLoading ? "Enviando..." : (isEditing ? "Actualizar" : "Comentar")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(CommentForm);