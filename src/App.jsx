import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CartDrawer from "./components/CartDrawer";
import Todo from "./todo";
  
import { AuthProvider } from "./components/hook/UseAut";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query
import AboutUs from "./components/AboutUs";
import Login from "./components/Loginn";
import Register from "./components/Registrate";

import SongSearchPage from "./components/theme/musica/SearchBar"; // Página de búsqueda de canciones
import SongDetailsPage from "./components/theme/musica/SongsDetaill"; // Página de detalles de la canción

import ProtectedRoute from "./components/theme/musica/ProtectedRoute";
import CommentsPage from "./components/theme/musica/CommentsPage"; // Nueva página de comentarios
import ProfilePage from "./components/theme/musica/UserProfile";
import MainPage from "./components/theme/musica/MainPage";

const queryClient = new QueryClient(); // Crear instancia de QueryClient

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div>
          <BrowserRouter>
            {/* Drawer del carrito */}
            <CartDrawer
              cartItems={cartItems}
              isOpen={isCartOpen}
              toggleDrawer={toggleCart}
            />

            {/* Barra de navegación */}
            <Navbar />

            {/* Definición de rutas */}
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/MainPage" element={<MainPage />} />
              <Route path="/AboutUS" element={<AboutUs />} />
              <Route path="/SingInPage" element={<Register />} />
              <Route path="/ProfilePage" element={<ProfilePage />} />
              <Route path="Todo" element={<Todo />} />

              {/* Rutas protegidas */}
              <Route
                path="/song/:songId"
                element={
                  <ProtectedRoute>
                    <SongDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
               
                element={
                  <ProtectedRoute>
                   
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Pie de página */}
            <Footer />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

