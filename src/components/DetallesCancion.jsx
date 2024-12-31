// UploadForm.js
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Cancion1 from './Cancion1'
import { px } from 'framer-motion';

const UploadForm = () => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!title || !artist || !file) {
            setMessage('Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('file', file);

        try {
            const response = await fetch('http://tu-api.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setMessage('Canción subida exitosamente.');
                setTitle('');
                setArtist('');
                setFile(null);
            } else {
                setMessage('Hubo un error al subir la canción.');
            }
        } catch (error) {
            setMessage('Error de red al intentar subir la canción.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Cancion1 />
        <Box
            sx={{
                maxWidth: 500,
                margin: '0 auto',
                padding: 4,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: 'white',
            }}
        >
            <Typography variant="h4" component="h2" gutterBottom textAlign="center">
                Subir Canción
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box mb={2}>
                    <TextField
                        label="Título de la canción"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        label="Artista"
                        variant="outlined"
                        fullWidth
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        required
                    />
                </Box>
                <Box mb={2}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                    >
                        Seleccionar Archivo
                        <input
                            type="file"
                            hidden
                            accept="audio/*"
                            onChange={handleFileChange}
                        />
                    </Button>
                    {file && (
                        <Typography variant="body2" mt={1} color="textSecondary">
                            Archivo seleccionado: {file.name}
                        </Typography>
                    )}
                </Box>
                <Box textAlign="center" mb={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Subir Canción'}
                    </Button>
                </Box>
                {message && (
                    <Alert severity={message.includes('exitosamente') ? 'success' : 'error'}>
                        {message}
                    </Alert>
                )}

                <Typography variant='button' fontFamily={'cursive'} fontSize={8} color='textSecondary' >
                powered by Djidji music 
                </Typography>
            </form>
        </Box>
        </div>
    );
};

export default UploadForm;

