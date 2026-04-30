import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../hook/UseAut";
import { Box, CircularProgress, Typography } from "@mui/material";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Loader global
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
          Verificando sesión...
        </Typography>
      </Box>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Roles (opcional)
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];

    const hasAccess = requiredRoles.some(role =>
      userRoles.includes(role)
    );

    if (!hasAccess) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{ from: location }}
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;