import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./hook/UseAut"; // Asegúrate de que la ruta sea correcta

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // Mientras se carga el estado de autenticación, puedes mostrar un spinner o pantalla de carga
  if (isLoading) {
    return <div>Loading...</div>; // Puedes usar un componente de carga personalizado aquí
  }

  // Si no está autenticado, redirige a /login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si está autenticado, renderiza el componente hijo
  return children;
};

export default ProtectedRoute;
