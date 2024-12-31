// ChatRoom.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const API_URL = 'https://mock-api.com/chat'; // Cambia esto por la URL de tu API real.

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    // Obtener mensajes al cargar
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/messages`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error al cargar los mensajes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    // Manejar envío de mensajes
    const handleSendMessage = async () => {
        if (newMessage.trim() && userName.trim()) {
            const newMsg = { user: userName, text: newMessage };

            try {
                const response = await fetch(`${API_URL}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newMsg),
                });

                if (response.ok) {
                    const savedMessage = await response.json();
                    setMessages([...messages, savedMessage]);
                    setNewMessage('');
                } else {
                    console.error('Error al enviar el mensaje.');
                }
            } catch (error) {
                console.error('Error al conectarse con la API:', error);
            }
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                padding: 2,
                backgroundColor: '#f4f6f8',
            }}
        >
            <Typography variant="h4" textAlign="center" gutterBottom>
                Comunidad Musical
            </Typography>

            {/* Lista de Mensajes */}
            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 2,
                    marginBottom: 2,
                }}
                id="chat-container"
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {messages.map((message, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color="primary"
                                        >
                                            {message.user}
                                        </Typography>
                                    }
                                    secondary={message.text}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <Divider />

            {/* Entrada de Mensaje */}
            <Box display="flex" gap={2} mt={2}>
                <TextField
                    label="Nombre de Usuario"
                    variant="outlined"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    sx={{ flex: 1 }}
                />
                <TextField
                    label="Escribe tu mensaje"
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{ flex: 3 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                >
                    Enviar
                </Button>
            </Box>
        </Box>
    );
};

export default ChatRoom;