import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";

const getInitials = (title = "") => {
  return title
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
};

const SmartCover = ({ src, title, size = 50 }) => {
  const theme = useTheme();

  const hasImage = Boolean(src);

  if (hasImage) {
    return (
      <Box
        component="img"
        src={src}
        alt={title}
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          objectFit: "cover",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${
          theme.palette.primary.main
        }, ${alpha(theme.palette.primary.dark, 0.8)})`,
        color: "white",
        fontWeight: 800,
        fontSize: size * 0.35,
        userSelect: "none",
      }}
    >
      <Typography fontWeight={800}>
        {getInitials(title)}
      </Typography>
    </Box>
  );
};

export default SmartCover;