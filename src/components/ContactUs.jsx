import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Mensaje enviado. ¡Gracias por contactarnos!");
  };

  return (
    <section style={{ padding: "2rem 1rem" }}>
      <h2>Contáctanos</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <input
          type="text"
          name="name"
          placeholder="Tu Nombre"
          value={formData.name}
          onChange={handleChange}
          style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Tu Correo Electrónico"
          value={formData.email}
          onChange={handleChange}
          style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        />
        <textarea
          name="message"
          placeholder="Tu Mensaje"
          value={formData.message}
          onChange={handleChange}
          style={{ display: "block", width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
        ></textarea>
        <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#007BFF", color: "#fff" }}>
          Enviar
        </button>
      </form>
    </section>
  );
};

export default ContactUs;


