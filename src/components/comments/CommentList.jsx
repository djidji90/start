// src/components/comments/CommentList.jsx
import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import CommentItem from "../comments/CommentItem";

const CommentList = ({ comments, songId, onCommentDeleted }) => {
  if (!comments?.length) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          songId={songId}
          onDeleted={onCommentDeleted}
        />
      ))}
    </Box>
  );
};

export default memo(CommentList);