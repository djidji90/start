// Componentes/HistorialPedidos.jsx

import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import DetallesPedido from "./DetallesPedidos";
import HistorialPedidos from "./HistorialPedidos";

const HistorialPedidosWrapper = () => {
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);

  const handlePedidoSeleccionado = (pedidoId) => {
    setSelectedPedidoId(pedidoId);
  };

  const handleVolver = () => {
    setSelectedPedidoId(null);
  };

  return (
    <Box>
      {selectedPedidoId ? (
        <DetallesPedido pedidoId={selectedPedidoId} onBack={handleVolver} />
      ) : (
        <HistorialPedidos onPedidoSeleccionado={handlePedidoSeleccionado} />
      )}
    </Box>
  );
};

export default HistorialPedidosWrapper;
