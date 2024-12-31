import React, { useState } from "react";

const SongUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    const response = await fetch("http://127.0.0.1:8000/api/songs/", {
      method: "POST",
      body: data,
    });
    if (response.ok) {
      alert("Canción subida con éxito");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="Título" onChange={handleChange} />
      <input type="text" name="artist" placeholder="Artista" onChange={handleChange} />
      <input type="text" name="genre" placeholder="Género" onChange={handleChange} />
      <input type="file" name="file" onChange={handleChange} />
      <button type="submit">Subir Canción</button>
    </form>
  );
};


export default SongUpload;
  