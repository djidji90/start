import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUserInfo(response.data);
        setNewName(response.data.name);
        setNewEmail(response.data.email);
      } catch (error) {
        setErrors({ general: "No se pudo obtener la información del usuario." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Validación de los formularios
  const validateUpdateInfo = () => {
    const newErrors = {};
    if (!newName.trim()) newErrors.name = "El nombre no puede estar vacío.";
    if (!newEmail.trim()) {
      newErrors.email = "El correo electrónico no puede estar vacío.";
    } else if (!/\S+@\S+\.\S+/.test(newEmail)) {
      newErrors.email = "El correo electrónico no es válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!newPassword.trim()) newErrors.password = "La nueva contraseña no puede estar vacía.";
    else if (newPassword.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!validateUpdateInfo()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/user/", // La ruta debe estar protegida para aceptar cambios
        { name: newName, email: newEmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSuccessMessage("Información actualizada correctamente.");
      setOpenSnackbar(true);
      setUserInfo(response.data); // Actualiza los datos del usuario
    } catch (error) {
      setErrors({ general: "Error al actualizar la información." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/change-password/", // Ruta para cambiar la contraseña
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSuccessMessage("Contraseña cambiada correctamente.");
      setOpenSnackbar(true);
    } catch (error) {
      setErrors({ general: "Error al cambiar la contraseña." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4">Perfil de Usuario</Typography>
      {loading && <CircularProgress />}
      {errors.general && <Alert severity="error">{errors.general}</Alert>}

      {userInfo && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6">Información Personal</Typography>
          <form onSubmit={handleUpdateInfo}>
            <TextField
              fullWidth
              label="Nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              sx={{ marginBottom: 2 }}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              sx={{ marginBottom: 2 }}
              error={!!errors.email}
              helperText={errors.email}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Actualizar Información
            </Button>
          </form>

          <Typography variant="h6" sx={{ marginTop: 4 }}>
            Cambiar Contraseña
          </Typography>
          <form onSubmit={handleChangePassword}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ marginBottom: 2 }}
              error={!!errors.password}
              helperText={errors.password}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2 }}
            >
              Cambiar Contraseña
            </Button>
          </form>

          <Button
            variant="outlined"
            color="error"
            sx={{ marginTop: 4 }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Box>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;

