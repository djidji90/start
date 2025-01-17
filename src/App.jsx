import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CartDrawer from "./components/CartDrawer";

import { AuthProvider } from "./components/hook/UseAut";
import AboutUs from "./components/AboutUs";
import Login from "./components/Loginn";
import Register from "./components/Registrate";

import SongSearchPage from "./components/theme/musica/SearchBar"; // Página de búsqueda de canciones
import SongDetailsPage from "./components/theme/musica/SongsDetaill"; // Página de detalles de la canción
import UserProfilePage from "./components/theme/musica/UserProfile"; // Página de perfil de usuario
import ProtectedRoute from "./components/theme/musica/ProtectedRoute";
import CommentsPage from "./components/theme/musica/CommentsPage"; // Nueva página de comentarios

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  const toggleCart = () => setCartOpen(!isCartOpen);

  return (
    <AuthProvider>
      <div>
        <BrowserRouter>
          <CartDrawer
            cartItems={cartItems}
            isOpen={isCartOpen}
            toggleDrawer={toggleCart}
          />

          <Navbar />

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/songs" element={<SongSearchPage />} />
            <Route path="/AboutUS" element={<AboutUs />} />
            <Route path="/SingInPage" element={<Register />} />

            {/* Ruta protegida para ver los detalles de la canción */}
            <Route
              path="/songs/:songId"
              element={
                <ProtectedRoute>
                  <SongDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta protegida para ver los comentarios de la canción */}
            <Route
              path="/songs/:songId/comments"
              element={
                <ProtectedRoute>
                  <CommentsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Ruta protegida para el perfil de usuario */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

