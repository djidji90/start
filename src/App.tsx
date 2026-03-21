// src/App.tsx
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
  Button,
  IconButton,
  useTheme,
  alpha
} from "@mui/material";
import { WifiOff, Wifi, Update, Close } from "@mui/icons-material";
import DownloadsPage from "./components/context/DownloadsPage";
import GenrePage from "./components/discovery/GenrePage";
// 🎵 Import Player
import { PlayerProvider } from "./components/PlayerContext";
import PlayerBar from "./components/theme/musica/PlayerBar";

// 🔥 IMPORTAR NUEVA LANDING PAGE
import LandingPage from "./components/landing/LandingPage";

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
  
  // ============================================
  // 🔔 ESTADOS PARA NOTIFICACIONES
  // ============================================
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineNotification, setShowOfflineNotification] = useState(false);
  const [showBackOnlineNotification, setShowBackOnlineNotification] = useState(false);

  // ============================================
  // 🔄 MANEJO DE CONEXIÓN DE RED
  // ============================================
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

  // ============================================
  // ✅ IMPLEMENTACIÓN DEL SERVICE WORKER CON NOTIFICACIÓN
  // ============================================
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('✅ Service Worker registrado correctamente:', registration.scope);
            
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('🔄 Nueva versión del Service Worker detectada');
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('📊 Estado del SW:', newWorker.state);
                  
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🎯 Nueva versión lista para activarse');
                    setWaitingWorker(newWorker);
                    setShowUpdateNotification(true);
                  }
                });
              }
            });

            registration.update();
          })
          .catch(error => {
            console.error('❌ Error registrando Service Worker:', error);
          });
      });
    }
  }, []);

  // ============================================
  // 🔄 FUNCIÓN PARA ACTUALIZAR LA APP
  // ============================================
  const handleUpdateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      waitingWorker.addEventListener('statechange', (event) => {
        const target = event.target as ServiceWorker;
        if (target.state === 'activated') {
          console.log('✅ Nueva versión activada, recargando...');
          window.location.reload();
        }
      });
      
      setShowUpdateNotification(false);
    } else {
      window.location.reload();
    }
  };

  // ============================================
  // 🔄 FUNCIÓN PARA IGNORAR LA ACTUALIZACIÓN
  // ============================================
  const handleDismissUpdate = () => {
    setShowUpdateNotification(false);
    setWaitingWorker(null);
  };

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProviderWrapper>
            <PlayerProvider>
              <BrowserRouter>
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

                {/* 🔔 NOTIFICACIONES GLOBALES */}
                <Snackbar
                  open={showUpdateNotification}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  autoHideDuration={null}
                  sx={{ zIndex: 1400 }}
                >
                  <Alert
                    severity="info"
                    icon={<Update />}
                    action={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={handleUpdateApp}
                          sx={{ fontWeight: 600 }}
                        >
                          ACTUALIZAR
                        </Button>
                        <IconButton
                          size="small"
                          onClick={handleDismissUpdate}
                          sx={{ p: 0.5, color: 'inherit' }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: '#fff',
                      '& .MuiAlert-icon': { color: '#fff' },
                      '& .MuiButton-root': { color: '#fff' },
                      '& .MuiIconButton-root': { color: '#fff' },
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    🚀 ¡Nueva versión disponible! Actualiza para disfrutar las mejoras.
                  </Alert>
                </Snackbar>

                <Snackbar
                  open={showOfflineNotification}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  autoHideDuration={5000}
                  sx={{ zIndex: 1400, mt: 7 }}
                >
                  <Alert
                    severity="warning"
                    icon={<WifiOff />}
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
                  sx={{ zIndex: 1400, mt: 7 }}
                >
                  <Alert
                    severity="success"
                    icon={<Wifi />}
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