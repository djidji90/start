import { useState, useEffect } from "react";
import "./styles.css"; // Asegúrate de que la ruta sea correcta
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

import Todo from "./todo";
import ThemeProviderWrapper from "./components/theme/ThemeProviderWrapper";

import { AuthProvider } from "./components/hook/UseAut";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query
import AboutUs from "./components/AboutUs";
import Login from "./components/Loginn";
import Register from "./components/Registrate";
import SongDetailsPage from "./components/theme/musica/SongsDetaill"; // Página de detalles de la canción
import ProtectedRoute from "./components/theme/musica/ProtectedRoute";
import ProfilePage from "./components/theme/musica/UserProfile";
import MainPage from "./components/theme/musica/MainPage";
import CategoriaProductos from "./components/theme/musica/ventas/CategoriaProductos";

// Crear instancia de QueryClient
const queryClient = new QueryClient();

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Manejo de Service Worker y PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Habilitar notificaciones push
        Notification.requestPermission();
      });
    }

    // Manejar instalación de PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProviderWrapper>
            {/* Drawer del carrito */}
            <CartDrawer cartItems={cartItems} isOpen={isCartOpen} toggleDrawer={toggleCart} />

            {/* Barra de navegación */}
            <Navbar />

            {/* Definición de rutas */}
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Login />} />
              <Route path="/MainPage" element={<MainPage />} />
              <Route path="/AboutUS" element={<AboutUs />} />
              <Route path="/categoria/:id" element={<CategoriaProductos />} />
              <Route path="/SingInPage" element={<Register />} />
              <Route path="/ProfilePage" element={<ProfilePage />} />
              <Route path="/Todo/*" element={<Todo />} />

              {/* Rutas protegidas */}
              <Route
                path="/song/:songId"
                element={
                  <ProtectedRoute>
                    <SongDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route element={<ProtectedRoute />} />
            </Routes>

            {/* Pie de página */}
            <Footer />
            
          </ThemeProviderWrapper>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
