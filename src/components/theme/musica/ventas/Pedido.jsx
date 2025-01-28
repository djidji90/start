import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const Checkout = ({ onPedidoCreado }) => {
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    const direccionTrimmed = direccion.trim();
    if (!direccionTrimmed || direccionTrimmed.length < 10) {
      setError("Por favor, ingresa una dirección válida (mínimo 10 caracteres).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/ventas/pedidos/crear_pedido/",
        { direccion_envio: direccionTrimmed },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );

      setSuccess(true);
      onPedidoCreado(response.data);

      // Reiniciar formulario tras éxito
      setDireccion("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      if (err.response) {
        const errorMsg =
          err.response.status === 401
            ? "No tienes permisos para realizar esta acción. Por favor, inicia sesión."
            : "Hubo un problema al procesar tu pedido. Inténtalo nuevamente.";
        setError(errorMsg);
      } else {
        setError("Error de conexión. Verifica tu internet.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 4,
        p: 3,
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Finalizar Pedido
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} aria-live="polite">
          ¡Pedido creado con éxito! Te notificaremos los detalles del envío.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} aria-live="polite">
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Dirección de envío"
        variant="outlined"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        margin="normal"
        error={!!error && (!direccion.trim() || direccion.trim().length < 10)}
        helperText={
          error && (!direccion.trim() || direccion.trim().length < 10)
            ? "Este campo debe tener al menos 10 caracteres."
            : ""
        }
        inputProps={{
          "aria-invalid": !!error,
          "aria-describedby": "direccion-helper",
        }}
      />

      <Button
        variant="contained"
        color={success ? "success" : "primary"}
        onClick={handleCheckout}
        disabled={loading}
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          fontWeight: "bold",
          textTransform: "uppercase",
          borderRadius: "8px",
          transition: "background-color 0.3s",
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Pedido"}
      </Button>
    </Box>
  );
};

export default Checkout;
