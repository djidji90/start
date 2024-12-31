// components/CommentSection.jsx
import React, { useState, useEffect } from "react";

const CommentSection = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/songs/${songId}/comments/`)
      .then((response) => response.json())
      .then((data) => setComments(data));
  }, [songId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://127.0.0.1:8000/api/comments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: songId, content: newComment }),
    });
    if (response.ok) {
      setNewComment("");
      const updatedComments = await response.json();
      setComments(updatedComments);
    }
  };

  return (
    <div>
      <h3>Comentarios</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>{comment.content}</li>
        ))}
      </ul>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario"
        ></textarea>
        <button type="submit">Comentar</button>
      </form>
    </div>
  );
};

export default CommentSection;