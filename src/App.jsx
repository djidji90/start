import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Noticias from "./components/Noticias";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubirCancion from "./components/SubirCancion";
import Comentarios from "./components/Cometarios";
import CartDrawer from "./components/CartDrawer";
import StorePageV2 from "./components/Tienda";
import ContactUs from "./components/AboutUs";
import { AuthProvider } from "./components/hook/UseAut";
import SignInPage from "./components/SignInCard";
import AboutUs from "./components/AboutUs";
import DetallesCancion from "./components/DetallesCancion";
import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";

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
            <Route path="/" element={<Home />} />
            <Route path="/Noticias" element={<Noticias />} />
            <Route path="/SubirCancion" element={<SubirCancion />} />
            <Route path="/Comentarios" element={<Comentarios />} />
            <Route path="/StoragePageV2" element={<StorePageV2 />} />
            <Route path="/SubirCancion" element={<SubirCancion />} />
            <Route
              path="/AboutUs"
              element={
                <PrivateRoute>
                  <AboutUs />{" "}
                </PrivateRoute>
              }
            />
            <Route path="/SingInPage" element={<SignInPage />} />
            <Route path="/SingInPage" element={<SignInPage />} />
            <Route path="/DetallesCancion" element={<DetallesCancion />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}
