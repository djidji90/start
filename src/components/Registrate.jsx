import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  MenuItem,
  InputAdornment,
  Link
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useConfig } from "./hook/useConfig"; 
import PasswordInput from "./PasswordInput";

const genderOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

const Register = () => {
  const navigate = useNavigate();
  const { api } = useConfig();
  const usernameRef = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    city: "",
    neighborhood: "",
    phone: "",
    gender: "",
    birth_date: "",
    country: "",
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const validations = {
      username: {
        required: true,
        maxLength: 150,
        validate: (val) => /^[\w.@+-]+$/.test(val),
        message: "Solo letras, dígitos y @/./+/-/_"
      },
      email: {
        required: true,
        maxLength: 254,
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        message: "Correo electrónico inválido"
      },
      password: {
        required: true,
        minLength: 8,
        validate: (val) => val.length >= 8,
        message: "Mínimo 8 caracteres"
      },
      password2: {
        required: true,
        validate: (val, form) => val === form.password,
        message: "Las contraseñas no coinciden"
      },
      phone: {
        validate: (val) => !val || /^\+?\d{10,15}$/.test(val),
        message: "Formato inválido (ej: +5491123456789)"
      },
      birth_date: {
        validate: (val) => !val || !isNaN(new Date(val).getTime()),
        message: "Fecha inválida"
      },
      terms_accepted: {
        required: true,
        validate: (val) => val === true,
        message: "Debes aceptar los términos"
      }
    };

    const rules = validations[name];
    if (!rules) return null;

    if (rules.required && !value && value !== false) {
      return "Este campo es requerido";
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }

    if (rules.validate && !rules.validate(value, formData)) {
      return rules.message || "Valor no válido";
    }

    return null;
  }, [formData]);

  const validateAllFields = useCallback(() => {
    const requiredFields = ['username', 'email', 'password', 'password2', 'terms_accepted'];
    const newErrors = {};
    const newTouched = {};
    
    requiredFields.forEach(key => {
      newTouched[key] = true;
      newErrors[key] = validateField(key, formData[key]);
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return Object.values(newErrors).every(error => error === null);
  }, [formData, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Format phone number
    if (name === 'phone') {
      finalValue = finalValue.replace(/[^\d+]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, finalValue)
      }));
    }
  }, [touched, validateField, errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name])
    }));
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      setErrors(prev => ({
        ...prev,
        general: "Por favor corrige los errores en el formulario"
      }));
      return;
    }

    setIsSubmitting(true);
    
    try {
     api.baseURL = "https://djibackend-production.up.railway.app";

const response = await axios.post(`${api.baseURL}/musica/register/`, formData);


      
      setSuccessMessage("¡Registro exitoso! Redirigiendo...");
      setOpenDialog(true);
      setErrors({});
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        city: "",
        neighborhood: "",
        phone: "",
        gender: "",
        birth_date: "",
        country: "",
        terms_accepted: false,
      });
      
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      const errorData = error.response?.data || {};
      
      if (errorData.errors) {
        const newErrors = {};
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          newErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        
        setErrors(newErrors);
        
        // Focus on first error field
        const firstErrorField = Object.keys(newErrors)[0];
        if (firstErrorField === 'username') {
          usernameRef.current?.focus();
        }
      } else {
        setErrors({
          general: errorData.message || "Error en el servidor. Intente nuevamente."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [api.baseURL, formData, navigate, validateAllFields]);

  const FieldError = ({ error, touched }) => {
    if (!error || !touched) return null;
    
    return (
      <Typography 
        variant="caption" 
        color="error"
        sx={{ display: 'block', mt: 0.5 }}
      >
        {error}
      </Typography>
    );
  };

  const isFormValid = useMemo(() => {
    const requiredFields = ['username', 'email', 'password', 'password2', 'terms_accepted'];
    return requiredFields.every(field => !validateField(field, formData[field]));
  }, [formData, validateField]);

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.title}>
        Registro de Usuario
      </Typography>

      {errors.general && (
        <Alert severity="error" sx={styles.alert}>
          {errors.general}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              inputRef={usernameRef}
              label={
                <>
                  Nombre de Usuario
                  <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.username && (touched.username || !!errors.username)}
              helperText={(touched.username || !!errors.username) && errors.username}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {formData.username.length}/150
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={
                <>
                  Correo Electrónico
                  <span style={{ color: 'red' }}>*</span>
                </>
              }
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email && (touched.email || !!errors.email)}
              helperText={(touched.email || !!errors.email) && errors.email}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {formData.email.length}/254
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre (Opcional)"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido (Opcional)"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.last_name}
              helperText={errors.last_name}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Teléfono (Opcional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+5491123456789"
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Género (Opcional)"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Nacimiento (Opcional)"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              onBlur={handleBlur}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ciudad (Opcional)"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Barrio (Opcional)"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="País (Opcional)"
              name="country"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordInput
              name="password"
              label={
                <>
                  Contraseña
                  <span style={{ color: 'red' }}>*</span>
                </>
              }
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              error={!!errors.password && (touched.password || !!errors.password)}
              helperText={
                (touched.password || !!errors.password) 
                  ? (errors.password || "Mínimo 8 caracteres")
                  : ""
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PasswordInput
              name="password2"
              label={
                <>
                  Confirmar Contraseña
                  <span style={{ color: 'red' }}>*</span>
                </>
              }
              value={formData.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              show={showPassword2}
              toggleShow={() => setShowPassword2(!showPassword2)}
              error={!!errors.password2 && (touched.password2 || !!errors.password2)}
              helperText={(touched.password2 || !!errors.password2) && errors.password2}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name="terms_accepted"
                  color="primary"
                />
              }
              label={
                <span>
                  Acepto los{' '}
                  <Link href="/terms" color="primary">
                    términos y condiciones
                  </Link>
                  <span style={{ color: 'red' }}>*</span>
                </span>
              }
            />
            <FieldError error={errors.terms_accepted} touched={touched.terms_accepted} />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting || !isFormValid}
              sx={styles.button}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography sx={styles.loginText}>
        ¿Ya tienes cuenta?{" "}
        <Button onClick={() => navigate("/")} sx={styles.loginLink}>
          Iniciar sesión
        </Button>
      </Typography>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        disablePortal
      >
        <DialogTitle>¡Registro Exitoso!</DialogTitle>
        <DialogContent>{successMessage}</DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              navigate("/");
            }} 
            color="primary"
          >
            Ir a Login
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isSubmitting} disablePortal>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Procesando registro...
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    mt: 5,
    p: 3,
    borderRadius: 2,
    boxShadow: 3,
    bgcolor: "background.paper",
  },
  title: {
    textAlign: "center",
    mb: 4,
    fontWeight: "bold",
    color: "primary.main",
  },
  alert: {
    mb: 2,
  },
  button: {
    py: 1.5,
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  loginText: {
    textAlign: "center",
    mt: 3,
    fontSize: "0.95rem",
  },
  loginLink: {
    textTransform: "none",
    fontWeight: "bold",
  },
};

Register.propTypes = {
  navigate: PropTypes.func,
};

export default React.memo(Register);