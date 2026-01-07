import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../hook/UseAut";
import { Box, CircularProgress, Typography } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeña pausa para evitar flashes
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Mientras carga el contexto
  if (loading || isChecking) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;