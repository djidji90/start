import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../hook/UseAut";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

// Componente de carga mejorado
const LoadingSpinner = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "background.default",
      zIndex: 9999,
    }}
  >
    <CircularProgress 
      size={60} 
      thickness={4} 
      sx={{ 
        mb: 2,
        color: "primary.main" 
      }} 
    />
    <Typography 
      variant="h6" 
      color="text.secondary"
      sx={{ fontWeight: 500 }}
    >
      Verificando autenticación...
    </Typography>
    <Typography 
      variant="body2" 
      color="text.disabled"
      sx={{ mt: 1 }}
    >
      Por favor, espere un momento
    </Typography>
  </Box>
);

// Componente para error de token
const TokenError = ({ message, onRetry }) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "background.default",
      p: 3,
      zIndex: 9999,
    }}
  >
    <Alert 
      severity="error" 
      sx={{ 
        mb: 3, 
        maxWidth: 500,
        width: '100%'
      }}
    >
      <Typography variant="body1" fontWeight="medium">
        Error de autenticación
      </Typography>
      <Typography variant="body2">
        {message}
      </Typography>
    </Alert>
    <Typography 
      variant="body2" 
      color="text.secondary"
      align="center"
      sx={{ mb: 2 }}
    >
      Serás redirigido a la página de inicio de sesión
    </Typography>
    <CircularProgress size={24} />
  </Box>
);

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    loading, 
    accessToken, 
    logout, 
    user 
  } = useContext(AuthContext);
  
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!isMounted) return;

      // Si no hay token, redirigir inmediatamente
      if (!accessToken) {
        if (isMounted) {
          setTokenError("No se encontró token de autenticación");
          setTimeout(() => {
            if (isMounted) {
              logout();
              setCheckingToken(false);
            }
          }, 1500);
        }
        return;
      }

      try {
        // Verificar formato del token
        if (!accessToken.includes('.')) {
          throw new Error("Formato de token inválido");
        }

        // Decodificar el token JWT
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          throw new Error("Token JWT mal formado");
        }

        const payloadBase64 = parts[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);

        // Verificar expiración
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          throw new Error("Tu sesión ha expirado");
        }

        // Verificar roles si se requieren
        if (requiredRoles.length > 0 && user) {
          const userRoles = user.roles || [];
          const hasRequiredRole = requiredRoles.some(role => 
            userRoles.includes(role)
          );
          
          if (!hasRequiredRole) {
            throw new Error("No tienes permisos para acceder a esta página");
          }
        }

        // Todo está bien
        if (isMounted) {
          setTokenError(null);
          setCheckingToken(false);
        }

      } catch (error) {
        console.error("Error verificando token:", error);
        
        if (isMounted) {
          setTokenError(error.message);
          
          // Esperar un momento antes de redirigir para mostrar el error
          setTimeout(() => {
            if (isMounted) {
              logout();
              setCheckingToken(false);
            }
          }, 2000);
        }
      }
    };

    // Solo verificar si hay token
    if (accessToken) {
      verifyToken();
    } else {
      setCheckingToken(false);
    }

    return () => {
      isMounted = false;
    };
  }, [accessToken, logout, user, requiredRoles]);

  // 1. Mostrar loading si está cargando el contexto o verificando token
  if (loading || checkingToken) {
    return <LoadingSpinner />;
  }

  // 2. Mostrar error de token si existe
  if (tokenError) {
    return <TokenError message={tokenError} />;
  }

  // 3. Redirigir si no está autenticado
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location,
          message: "Por favor, inicia sesión para continuar"
        }} 
      />
    );
  }

  // 4. Verificar roles (si se requieren)
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          replace 
          state={{ 
            from: location,
            requiredRoles,
            userRoles
          }} 
        />
      );
    }
  }

  // 5. Todo está bien, renderizar children
  return children;
};

// Propiedades por defecto
ProtectedRoute.defaultProps = {
  requiredRoles: []
};

export default ProtectedRoute;