import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  IconButton,
  Button,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const songs = [
  { title: "amangefe", artist: "hermanos maga", image: "dog.jpg", genero: "balada", año_publicacion: 2020 },
  { title: "cohiba", artist: "kiko b & cesario mc", image: "cat.jpg", genero: "hip hop", año_publicacion: 2024 },
  { title: "marihauna", artist: "teddy bala", image: "perro.jpg", genero: "afro beat" , año_publicacion: 2024},
  { title: "amangefe", artist: "hermanos maga", image: "dog.jpg", genero: "balada", año_publicacion: 2020 },
  { title: "cohiba", artist: "kiko b & cesario mc", image: "cat.jpg", genero: "hip hop", año_publicacion: 2024 },
  { title: "marihauna", artist: "teddy bala", image: "perro.jpg", genero: "afro beat" , año_publicacion: 2024},
];

const SongCard = ({ song }) => {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments((prev) => [...prev, comment]);
      setComment("");
    }
  };

  return (
    <Card sx={{ maxWidth: 320, margin: 2, boxShadow: 10}}>
      {/* Imagen de la canción */}
      <CardMedia
        component="img"
        height="140"
        image={song.image}
        alt={song.title}
      />
      {/* Contenido de la canción */}
      <CardContent>
        <Typography variant="h6" component="div">
        titulo:  {song.title} 
        </Typography>
        <Typography variant="inherit" color="info">
         artista: {song.artist}
        </Typography>
        <Typography variant="body2" color="text.secondary">
         genero: {song.genero}
        </Typography>
        <Typography variant="body2" color="text.secondary">
         publicado año: {song.año_publicacion}
        </Typography>
      </CardContent>
      {/* Botones de Like y comentarios */}
      <CardActions>
        <IconButton color="primary" onClick={handleLike}>
          <FavoriteIcon /> <span style={{ marginLeft: 8 }}>{likes}</span>
        </IconButton>
        <IconButton color="secondary">
          <ChatBubbleOutlineIcon />
        </IconButton>
      </CardActions>
      {/* Campo para agregar comentarios */}
      <CardContent>
        <TextField
          fullWidth
          variant="outlined"
          label="Añadir un comentario"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCommentSubmit}
          sx={{ marginTop: 2 }}
        >
          Enviar
        </Button>
        {/* Lista de comentarios */}
        <List sx={{ marginTop: 2 }}>
          {comments.map((comm, index) => (
            <ListItem key={index}>
              <ListItemText primary={comm} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const SongList = () => {
  return (
    <Grid container spacing={2} justifyContent="center">
      {songs.map((song, index) => (
        <Grid item key={index}>
          <SongCard song={song} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SongList;
  
