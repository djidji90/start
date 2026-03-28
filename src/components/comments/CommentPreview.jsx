// src/components/comments/CommentPreview.jsx
import React, { memo } from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const CommentPreview = ({ totalCount, comments, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={40} height={14} />
      </Box>
    );
  }

  if (!totalCount || totalCount === 0) {
    return (
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5,
        color: "text.secondary",
      }}>
        <ChatBubbleOutline sx={{ fontSize: 12 }} />
        <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
          Comentar
        </Typography>
      </Box>
    );
  }

  const safeComments = Array.isArray(comments) ? comments : [];
  const hasMoreComments = safeComments.length < totalCount;

  return (
    <Box>
      {/* Contador */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        <ChatBubbleOutline sx={{ fontSize: 12, color: "text.secondary" }} />
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
          {totalCount} {totalCount === 1 ? "comentario" : "comentarios"}
        </Typography>
      </Box>

      {/* Preview de últimos comentarios */}
      <Box 
        className="comments-preview"
        sx={{ 
          pl: 1, 
          borderLeft: "2px solid",
          borderLeftColor: alpha("#9CA3AF", 0.3),
          transition: "all 0.2s",
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
        
        {hasMoreComments && (
          <Typography variant="caption" sx={{ fontSize: "0.55rem", color: "primary.main" }}>
            Ver {totalCount - safeComments.length} más...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default memo(CommentPreview);