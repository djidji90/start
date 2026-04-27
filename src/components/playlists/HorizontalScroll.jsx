import React from "react";
import { Box } from "@mui/material";

const HorizontalScroll = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        pb: 1,
        scrollSnapType: "x mandatory",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {React.Children.map(children, (child) => (
        <Box sx={{ scrollSnapAlign: "start", flexShrink: 0 }}>
          {child}
        </Box>
      ))}
    </Box>
  );
};

export default HorizontalScroll;