export default function Avatar({persona}) {
    return (
      
      <div className="avatar" >
         <img
        className="avatar"
        src="dog.jpg"
        alt="Lin Lanying"
        width={300}
        height={300}
      />
       <p> nombre  {persona.nombre} </p>
       <p> edad {persona.edad}</p>
       <p> nacionalidad {persona.nacionalidad}</p>
        
      </div>
    
     
    );
  }