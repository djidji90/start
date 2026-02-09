// components/upload/QuotaDisplay.jsx
import React from "react";
import { Box, Typography, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";

const QuotaDisplay = ({ quota }) => {
  if (!quota) {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="caption" sx={{ color: "#666" }}>
          Cargando cuota...
        </Typography>
      </Box>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getColor = (percentage) => {
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "primary";
  };

  return (
    <Tooltip 
      title={`Usado: ${formatBytes(quota.used)} / Total: ${formatBytes(quota.limit)}`}
      arrow
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 120 }}>
          <LinearProgress 
            variant="determinate" 
            value={quota.percentage} 
            color={getColor(quota.percentage)}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ color: "#666", fontSize: "0.7rem" }}>
            {quota.percentage.toFixed(1)}% usado
          </Typography>
        </Box>
        <IconButton size="small">
          <Info sx={{ fontSize: 16, color: "#666" }} />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

export default QuotaDisplay;