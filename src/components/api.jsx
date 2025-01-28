import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tienda from './components/theme/musica/ventas/Tienda';  // Asegúrate de tener el componente Tienda
import Todo from './Todo';  // Tu componente Todo que gestiona las rutas secundarias
import Login from './components/Login'; // Asumiendo que tienes un componente de login
import { CssBaseline, Container } from '@mui/material';
import { registerUser, loginUser, fetchProtectedData } from './api'; // Importar las funciones de la API

// Función de ejemplo para realizar el login y obtener el token
const login = async (credentials) => {
  try {
    const response = await loginUser(credentials);
    const token = response.data.access_token;
    localStorage.setItem('access_token', token);  // Guardar el token
  } catch (error) {
    console.error('Error al iniciar sesión', error);
  }
};

// Componente principal con enrutamiento
const App = () => {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="lg">
        <Routes>
          {/* Ruta para la página principal de la tienda */}
          <Route path="/" element={<Tienda />} />

          {/* Ruta para el componente Todo */}
          <Route path="/todo/*" element={<Todo />} />

          {/* Ruta para el login */}
          <Route path="/login" element={<Login onLogin={login} />} />

          {/* Otras rutas que puedas necesitar */}
          {/* <Route path="/register" element={<Register />} /> */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
