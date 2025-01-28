import React, { useState, useEffect } from "react";
import axios from "axios";

const CommentsSection = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Obteniendo comentarios para songId:", songId);
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api2/songs/${songId}/comments/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        });
        console.log("Comentarios recibidos:", response.data.results); // Verificar datos
        setComments(response.data.results); // Actualizar estado con comentarios
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [songId]); // Se ejecuta nuevamente si cambia el songId

  if (loading) {
    return <p>Cargando comentarios...</p>;
  }

  return (
    <div>
      <h3>Comentarios:</h3>
      {comments.length === 0 ? (
        <p>No hay comentarios disponibles.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p><strong>{comment.user}</strong>: {comment.content}</p>
            <p><small>{new Date(comment.created_at).toLocaleString()}</small></p>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentsSection;


