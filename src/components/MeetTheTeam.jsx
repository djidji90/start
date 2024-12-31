import React from "react";


const teamMembers = [
  { name: "Leoncio Machimbo Pecho", role: "CEO y Fundador", image: "cat.jpg" },
  { name: "Juan Pérez", role: "Desarrollador Backend", image: "nike.jpg" },
  { name: "María González", role: "Diseñadora UI/UX", image: "dog.jpg" },
];

const MeetTheTeam = () => {
  return (
    <section style={{ padding: "1rem" }}>
      
      <h2>Conoce a Nuestro Equipo</h2>
      <div style={{ display: "-webkit-flex", justifyContent: "space-around" }}>
        {teamMembers.map((member, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <img
              src={member.image}
              alt={member.name}
              style={{ borderRadius: "50%", width: "200px", height: "200px" }}
            />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MeetTheTeam;


