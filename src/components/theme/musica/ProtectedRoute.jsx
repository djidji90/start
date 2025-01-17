import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    // Redirige al login si no está autenticado
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

