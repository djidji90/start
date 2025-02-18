import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import axios from "axios";

const CommentItem = ({ comment }) => {
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);

  const handleReaction = async (type) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api2/comments/${comment.id}/react/`, { type });
      setLikes(type === "like" ? likes + 1 : likes);
      setDislikes(type === "dislike" ? dislikes + 1 : dislikes);
    } catch (error) {
      console.error("Error al reaccionar:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1 }}>
      <Typography variant="body2">{comment.text}</Typography>
      <Box>
        <IconButton onClick={() => handleReaction("like")}><ThumbUp /></IconButton>
        <IconButton onClick={() => handleReaction("dislike")}><ThumbDown /></IconButton>
      </Box>
    </Box>
  );
};

export default CommentItem;
