import { useState, useEffect, lazy, Suspense } from "react";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ThemeProviderWrapper from "./components/theme/ThemeProviderWrapper";
import { AuthProvider } from "./components/hook/UseAut";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Snackbar, 
  Alert,
  useTheme,
  alpha
} from "@mui/material";
import { WifiOff, Wifi } from "@mui/icons-material";
import DownloadsPage from "./components/context/DownloadsPage";
import GenrePage from "./components/discovery/GenrePage";
import { PlayerProvider } from "./components/PlayerContext";
import PlayerBar from "./components/theme/musica/PlayerBar";
import LandingPage from "./components/landing/LandingPage";

// Importar el hook y componente de actualización
import { useServiceWorker } from './components/hook/services/useServiceWorker';
import UpdateNotification from './components/landing/UpdateNotification';

// Configuración React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60000, refetchOnWindowFocus: false, retry: 2 } },
});

// Lazy components
const Todo = lazy(() => import("./todo"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Login = lazy(() => import("./components/Loginn"));
const Register = lazy(() => import("./components/Registrate"));
const ProfilePage = lazy(() => import("./components/theme/musica/UserProfile"));
const CategoriaProductos = lazy(() => import("./components/theme/musica/ventas/CategoriaProductos"));
const ProtectedRoute = lazy(() => import("./components/theme/musica/ProtectedRoute"));
const TechStyleHub = lazy(() => import("./components/TechStyleHub"));
const MainPage = lazy(() => import("./components/theme/musica/MainPage"));
import ArtistProfile from "./components/profile/ArtistProfile";

// Spinner global
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
    <CircularProgress size={70} thickness={4.5} sx={{ color: "primary.main", mb: 2 }} />
    <Typography variant="h6" color="text.secondary">
      Cargando...
    </Typography>
  </Box>
);

export default function App() {
  const theme = useTheme();
  const [cartItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);
  
  // 🚀 USAR HOOK DE SERVICE WORKER
  const { showUpdateNotification, updateApp, dismissUpdate } = useServiceWorker();
  
  // 🔔 ESTADOS PARA NOTIFICACIONES DE RED
  const [, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [showBackOnlineNotification, setShowBackOnlineNotification] = useState(false);

  // 🔄 MANEJO DE CONEXIÓN DE RED
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexión restablecida');
      setIsOffline(false);
      setShowOfflineNotification(false);
      setShowBackOnlineNotification(true);
      setTimeout(() => setShowBackOnlineNotification(false), 4000);
    };

    const handleOffline = () => {
      console.log('⚠️ Conexión perdida');
      setIsOffline(true);
      setShowOfflineNotification(true);
      setShowBackOnlineNotification(false);
      setTimeout(() => setShowOfflineNotification(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProviderWrapper>
            <PlayerProvider>
              <BrowserRouter>
                {/* Componentes principales */}
                <CartDrawer cartItems={cartItems} isOpen={isCartOpen} toggleDrawer={toggleCart} />
                <Navbar />

                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/SingInPage" element={<Register />} />
                    <Route path="/MainPage" element={<MainPage />} />
                    <Route path="/AboutUS" element={<AboutUs />} />
                    <Route path="/categoria/:id" element={<CategoriaProductos />} />
                    <Route path="/ProfilePage" element={<ProfilePage />} />
                    <Route path="/Todo/*" element={<Todo />} />
                    <Route path="/TechStyleHub" element={<TechStyleHub />} />
                    <Route path="/downloads" element={<DownloadsPage />} />
                    <Route path="/genre/:genre" element={<GenrePage />} />
                    <Route path="/perfil/:username" element={<ArtistProfile />} />
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
                <PlayerBar />

                {/* 🔔 NOTIFICACIÓN DE ACTUALIZACIÓN */}
                <UpdateNotification
                  open={showUpdateNotification}
                  onUpdate={updateApp}
                  onDismiss={dismissUpdate}
                />

                {/* 🔔 NOTIFICACIONES DE RED - CORREGIDAS */}
                <Snackbar
                  open={showOfflineNotification}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  autoHideDuration={5000}
                  onClose={() => setShowOfflineNotification(false)}
                  sx={{ zIndex: 1400, mt: 7 }}
                >
                  <Alert
                    severity="warning"
                    icon={<WifiOff />}
                    onClose={() => setShowOfflineNotification(false)}
                    sx={{
                      bgcolor: theme.palette.warning.dark,
                      color: '#fff',
                      '& .MuiAlert-icon': { color: '#fff' },
                      boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
                    }}
                  >
                    📡 Sin conexión a internet. Algunas funciones estarán limitadas.
                  </Alert>
                </Snackbar>

                <Snackbar
                  open={showBackOnlineNotification}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  autoHideDuration={4000}
                  onClose={() => setShowBackOnlineNotification(false)}
                  sx={{ zIndex: 1400, mt: 7 }}
                >
                  <Alert
                    severity="success"
                    icon={<Wifi />}
                    onClose={() => setShowBackOnlineNotification(false)}
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: '#fff',
                      '& .MuiAlert-icon': { color: '#fff' },
                      boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
                    }}
                  >
                    🌐 Conexión restablecida. Todo funciona correctamente.
                  </Alert>
                </Snackbar>
              </BrowserRouter>
            </PlayerProvider>
          </ThemeProviderWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}