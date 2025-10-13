import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, styled, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import '@fontsource-variable/inter';

const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: "'Inter Variable', sans-serif",
}));

const messages = [
  "djidji music swet swet music",
  "la mejor plataforma de música 100% Ecuato guineana",
  "desde guinea-ecuatorial para el mundo",
];

const getRandomMessage = () => {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
};

const getLiveTime = () => {
  const now = new Date();
  return now.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const ConstructionBanner = () => {
  const [currentTime, setCurrentTime] = useState(getLiveTime());
  const [message] = useState(getRandomMessage);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getLiveTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(120deg, #0f0c29, #302b63, #24243e)",
        color: "white",
      }}
    >
      <motion.div
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: "100% 50%" }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "linear-gradient(270deg, #ff6ec4, #7873f5, #4ADEDE)",
          backgroundSize: "600% 600%",
          opacity: 0.1,
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          bottom: 30,
          width: "60%",
          height: 10,
          backgroundColor: "rgba(255,255,255,0.3)",
          borderRadius: 50,
        }}
        animate={{
          width: ["0%", "70%", "90%", "100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          top: "15%",
          left: "12%",
          opacity: 0.3,
          zIndex: 1,
        }}
        animate={{
          y: [-15, 15, -15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MusicNoteIcon sx={{ fontSize: 80, color: "white" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 2 }}
      >
        <ConstructionIcon
          sx={{
            fontSize: { xs: 60, sm: 80, md: 90 },
            color: "gold",
            mb: 2,
            filter: "drop-shadow(0 0 8px gold)",
          }}
        />
      </motion.div>

      <GradientText
        variant="h3"
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        sx={{
          fontWeight: 800,
          mb: 2,
          fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        ¡Grandes cosas vienen en camino!
      </GradientText>

      <Typography
        variant="h6"
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        sx={{
          mb: 4,
          maxWidth: 600,
          fontSize: { xs: "0.95rem", sm: "1rem" },
          color: "rgba(255, 255, 255, 0.85)",
          fontFamily: "'Inter Variable', sans-serif",
        }}
      >
        Estamos trabajando arduamente para traerte la mejor experiencia musical de Guinea Ecuatorial. Mientras tanto, celebra con nosotros el talento de nuestros artistas. No olvides visitar nuestra tienda y comprar los productos que más te gusten. Estamos a tu disposición todos los días de la semana 24/7.
      </Typography>

      <Box
        component={motion.div}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        sx={{
          bgcolor: "#ff6ec4",
          color: "white",
          px: 4,
          py: 2,
          borderRadius: 3,
          mb: 3,
          zIndex: 2,
          boxShadow: "0 0 20px rgba(255,110,196,0.4)",
          fontFamily: "'Inter Variable', sans-serif",
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        <Typography variant="body1">{message}</Typography>
      </Box>

      <Button
        variant="contained"
        href="/Todo"
        sx={{
          mb: 4,
          px: 4,
          py: 1.5,
          background: "linear-gradient(to right, #ff6ec4, #7873f5)",
          fontWeight: 600,
          borderRadius: 10,
          textTransform: "none",
          fontSize: { xs: "0.85rem", sm: "1rem" },
          fontFamily: "'Inter Variable', sans-serif",
        }}
      >
        Ir a la Tienda
      </Button>

      <Box
        sx={{
          mt: 2,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.1)",
          color: "#fff",
          fontFamily: "'Inter Variable', sans-serif",
          boxShadow: "0 0 10px rgba(255,255,255,0.1)",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography variant="body2">
          Tiempo actual en Djidji Music: <strong>{currentTime}</strong>
        </Typography>
      </Box>

      <Typography
        variant="caption"
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        sx={{
          position: "absolute",
          bottom: 20,
          fontSize: "0.75rem",
          letterSpacing: 1.5,
          color: "rgba(255,255,255,0.6)",
          fontFamily: "'Inter Variable', sans-serif",
        }}
      >
        djidji music ®
      </Typography>

      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            fontSize: 24 + Math.random() * 10,
            color: "rgba(255,255,255,0.2)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 0,
          }}
          initial={{ scale: 0, rotate: Math.random() * 360 }}
          animate={{
            y: [0, -50 - Math.random() * 100],
            scale: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ♫
        </motion.div>
      ))}
    </Box>
  );
};

export default ConstructionBanner;
