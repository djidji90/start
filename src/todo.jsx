import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Tienda from "./components/ventas/Tienda";
import DetallesProducto from "./components/ventas/DetallesProducto";
import CarritoCompras from "./components/ventas/CarritoCompras";
import HistorialPedidos from "./components/ventas/HistorialPedidosWrapper";
import DetallesPedido from "./components/ventas/DetallesPedidos";
import { CssBaseline, Container } from "@mui/material";

// Nuevos componentes de la tienda
import ListaProductos from "./components/ventas/Productos";
import DetallesProductoTienda from "./components/ventas/DetallesProducto";
import ConfirmacionCompra from "./components/ventas/Pedido";

const Todo = () => {
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const handleProductoClick = (producto) => {
    setSelectedProducto(producto);
  };

  const handlePedidoClick = (pedido) => {
    setSelectedPedido(pedido);
  };

  const resetProducto = () => {
    setSelectedProducto(null);
  };

  const resetPedido = () => {
    setSelectedPedido(null);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Routes>
          <Route
            path="/"
            element={<Tienda onProductoClick={handleProductoClick} />}
          />
          <Route
            path="/producto/:id"
            element={
              <DetallesProducto
                producto={selectedProducto}
                onBack={resetProducto}
              />
            }
          />
          <Route
            path="/carrito"
            element={
              <CarritoCompras onBack={() => (window.location.href = "/")} />
            }
          />
          <Route
            path="/pedidos"
            element={<HistorialPedidos onPedidoClick={handlePedidoClick} />}
          />
          <Route
            path="/pedido/:id"
            element={
              <DetallesPedido
                pedidoId={selectedPedido?.id}
                onBack={resetPedido}
              />
            }
          />
          {/* Nuevas rutas de la tienda */}
          <Route
            path="/tienda"
            element={<ListaProductos onProductoClick={handleProductoClick} />}
          />
          <Route
            path="/tienda/producto/:id"
            element={
              <DetallesProductoTienda
                producto={selectedProducto}
                onBack={resetProducto}
              />
            }
          />
          <Route path="/tienda/confirmacion" element={<ConfirmacionCompra />} />
        </Routes>
      </Container>
    </>
  );
};

export default Todo;

