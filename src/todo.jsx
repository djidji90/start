import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Tienda from "./components/theme/musica/ventas/Tienda";

import { CssBaseline, Container } from "@mui/material";

// Nuevos componentes de la tienda

const Todo = () => {
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState([]); // Estado para los productos filtrados

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

  const handleCategoriaClick = (productos) => {
    setSelectedCategoryProducts(productos); // Actualiza los productos mostrados en la tienda
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Tienda
          onProductoClick={handleProductoClick}
          onCategoriaClick={handleCategoriaClick} // Pasamos la función a Tienda
          selectedCategoryProducts={selectedCategoryProducts} // Pasamos los productos filtrados
        />
      </Container>
    </>
  );
};

export default Todo;


