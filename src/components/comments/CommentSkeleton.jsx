// src/components/comments/CommentSkeleton.jsx
import React from "react";
import { Box, Skeleton } from "@mui/material";

const CommentSkeleton = ({ count = 3 }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1.5, p: 1.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={60} height={16} />
            </Box>
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CommentSkeleton;