

function Gellery({nombre, edad, nacionalidad}) {  
console.log(nombre)
    return (  
      <div>
        <div>
          <h6>nombre {nombre } </h6>
          <h6>edad {edad} </h6>
          <h6>nacionalidad {nacionalidad} </h6>
          </div> 

      <img className="avatar"
        src="cat.jpg"
        alt="Katherine Johnson"
      />
       <img className="perro"
        src="dog.jpg"
        alt="Katherine Johnson"
      />
      </div>
    );    
  }

  export default Gellery;



  