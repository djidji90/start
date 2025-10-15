import { useState, useEffect, lazy, Suspense } from "react";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ThemeProviderWrapper from "./components/theme/ThemeProviderWrapper";
import { AuthProvider } from "./components/hook/UseAut";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, CircularProgress, Typography } from "@mui/material";

// 🔹 Solución al error "Cannot find module for './styles.css'"
declare module "*.css";

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Componentes cargados dinámicamente
const Todo = lazy(() => import("./todo"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Login = lazy(() => import("./components/Loginn"));
const Register = lazy(() => import("./components/Registrate"));
const ProfilePage = lazy(() => import("./components/theme/musica/UserProfile"));
const MainPage = lazy(() => import("./components/theme/musica/MainPage"));
const CategoriaProductos = lazy(() => import("./components/theme/musica/ventas/CategoriaProductos"));
const ProtectedRoute = lazy(() => import("./components/theme/musica/ProtectedRoute"));
const TechStyleHub = lazy(() => import("./components/TechStyleHub"));

// Componente de carga
const LoadingSpinner = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      bgcolor: "rgba(255, 255, 255, 0.75)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1300,
      backdropFilter: "blur(3px)",
    }}
  >
    <CircularProgress
      size={70}
      thickness={4.5}
      sx={{
        color: "primary.main",
        mb: 2,
      }}
    />
    <Typography variant="h6" color="text.secondary">
      Cargando...
    </Typography>
  </Box>
);

export default function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((_registration) => {
        Notification.requestPermission();
      });
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProviderWrapper>
          <BrowserRouter>
            <CartDrawer cartItems={cartItems} isOpen={isCartOpen} toggleDrawer={toggleCart} />
            <Navbar />

            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/MainPage" element={<MainPage />} />
                <Route path="/AboutUS" element={<AboutUs />} />
                <Route path="/categoria/:id" element={<CategoriaProductos />} />
                <Route path="/SingInPage" element={<Register />} />
                <Route path="/ProfilePage" element={<ProfilePage />} />
                <Route path="/Todo/*" element={<Todo />} />
                <Route path="/TechStyleHub" element={<TechStyleHub />} />

                <Route
                  path="/song/:songId"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>

            <Footer />
          </BrowserRouter>
        </ThemeProviderWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}
