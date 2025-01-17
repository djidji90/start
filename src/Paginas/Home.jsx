// SignUpCard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import * as Yup from "yup"; // Validación avanzada
import { useFormik } from "formik"; // Manejo del formulario
import { styled } from "@mui/system";

const API_URL = "https://mock-api.com/auth/register"; // Reemplazar con tu API real

export default function SignUpCard() {
  const navigate = useNavigate();

  // Estados para el Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Validación con Yup
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("El nombre es obligatorio.")
      .min(2, "El nombre debe tener al menos 2 caracteres."),
    lastName: Yup.string()
      .required("El apellido es obligatorio.")
      .min(2, "El apellido debe tener al menos 2 caracteres."),
    email: Yup.string()
      .email("Correo electrónico inválido.")
      .required("El correo es obligatorio."),
    password: Yup.string()
      .required("La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula.")
      .matches(/\d/, "Debe contener al menos un número."),
    confirmPassword: Yup.string()
      .required("La confirmación de contraseña es obligatoria.")
      .oneOf([Yup.ref("password")], "Las contraseñas no coinciden."),
    city: Yup.string().required("La ciudad es obligatoria."),
    neighborhood: Yup.string().required("El barrio es obligatorio."),
    phone: Yup.string()
      .matches(/^\d{7,10}$/, "El teléfono debe tener entre 7 y 10 dígitos.")
      .required("El teléfono es obligatorio."),
  });

  // Formik para manejar el formulario
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      city: "",
      neighborhood: "",
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          setSnackbar({
            open: true,
            message: "Registro exitoso. Redirigiendo...",
            severity: "success",
          });
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const errorData = await response.json();
          setSnackbar({
            open: true,
            message: errorData.message || "Error al registrarse.",
            severity: "error",
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error de red. Por favor, inténtalo nuevamente.",
          severity: "error",
        });
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f8",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Regístrate en Djidji Music 🎵
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          gutterBottom
        >
          Crea una cuenta para explorar y compartir tu música favorita.
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 2 }}
          onSubmit={formik.handleSubmit}
        >
          <TextField
            label="Nombre"
            name="firstName"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            label="Apellido"
            name="lastName"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
           <TextField
            label="Correo Electrónico"
            name="email"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />
          <TextField
            label="Ciudad"
            name="city"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.city}
            onChange={formik.handleChange}
            error={formik.touched.city && Boolean(formik.errors.city)}
            helperText={formik.touched.city && formik.errors.city}
          />
          <TextField
            label="Barrio"
            name="neighborhood"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.neighborhood}
            onChange={formik.handleChange}
            error={
              formik.touched.neighborhood && Boolean(formik.errors.neighborhood)
            }
            helperText={
              formik.touched.neighborhood && formik.errors.neighborhood
            }
          />
          <TextField
            label="Teléfono"
            name="phone"
            fullWidth
            variant="outlined"
            margin="normal"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              "Registrarse"
            )}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate("/login")}
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}