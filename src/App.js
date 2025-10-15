import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const LoadingSpinner = () => (_jsxs(Box, { sx: {
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
    }, children: [_jsx(CircularProgress, { size: 70, thickness: 4.5, sx: {
                color: "primary.main",
                mb: 2,
            } }), _jsx(Typography, { variant: "h6", color: "text.secondary", children: "Cargando..." })] }));
export default function App() {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setCartOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
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
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(ThemeProviderWrapper, { children: _jsxs(BrowserRouter, { children: [_jsx(CartDrawer, { cartItems: cartItems, isOpen: isCartOpen, toggleDrawer: toggleCart }), _jsx(Navbar, {}), _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/MainPage", element: _jsx(MainPage, {}) }), _jsx(Route, { path: "/AboutUS", element: _jsx(AboutUs, {}) }), _jsx(Route, { path: "/categoria/:id", element: _jsx(CategoriaProductos, {}) }), _jsx(Route, { path: "/SingInPage", element: _jsx(Register, {}) }), _jsx(Route, { path: "/ProfilePage", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/Todo/*", element: _jsx(Todo, {}) }), _jsx(Route, { path: "/TechStyleHub", element: _jsx(TechStyleHub, {}) }), _jsx(Route, { path: "/song/:songId", element: _jsx(ProtectedRoute, { children: _jsx(MainPage, {}) }) })] }) }), _jsx(Footer, {})] }) }) }) }));
}
