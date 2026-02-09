// UploadPage.jsx - ESQUELETO SIMPLIFICADO
import React from 'react';
import { 
  Box, Container, Typography, Paper, Button,
  LinearProgress, Alert, IconButton, Chip
} from "@mui/material";
import { CloudUpload, Delete, Cancel } from "@mui/icons-material";
import { useUpload } from '../hooks/useUpload';

const UploadPage = () => {
  const {
    files,
    setFiles,
    uploads,
    quota,
    loading,
    error,
    validateFile,
    uploadFiles,
    cancelUpload,
    clearCompleted,
    getStats
  } = useUpload();

  // 1. Manejo de selección de archivos
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    // Validar y agregar a files...
  };

  // 2. Manejo de upload
  const handleUpload = async () => {
    // Usar uploadFiles...
  };

  // 3. UI tendrá:
  // - Área de drag & drop (simplificada)
  // - Lista de archivos seleccionados
  // - Uploads en progreso
  // - Información de cuota
  // - Botones de acción

  return (
    <Box sx={{ backgroundColor: "#ffffff", pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Header similar a tu MainPage */}
        <Typography variant="h1" sx={{ textAlign: "center", mb: 4 }}>
          Subir Música
        </Typography>

        {/* Dos paneles: Selección + Progreso */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          
          {/* PANEL IZQUIERDO: Selección de archivos */}
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Seleccionar Archivos
            </Typography>
            
            {/* Aquí irá:
              - Input file o drag & drop
              - Lista de archivos validados
              - Botón de subir
            */}
          </Paper>

          {/* PANEL DERECHO: Uploads en progreso */}
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Uploads en Progreso
            </Typography>
            
            {/* Aquí irá:
              - Lista de uploads con progress bars
              - Botones de cancelar
              - Estadísticas
            */}
          </Paper>

        </Box>

        {/* Información de cuota */}
        {quota && (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="body2">
              Espacio usado: {quota.percentage}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={quota.percentage} 
              sx={{ mt: 1 }}
            />
          </Paper>
        )}

        {/* Mensajes de error/éxito */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default UploadPage;