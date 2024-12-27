export default function Lista() {
    const chemists = people.filter(person =>
      person.profession === 'químico'
    );
    const listItems = chemists.map(person =>
      <li>
        <img
          src={getImageUrl(person)}
          alt={person.name}
        />
        <p>
          <b>{person.name}:</b>
          {' ' + person.profession + ' '}
          conocido/a por {person.accomplishment}
        </p>
      </li>
    );
    return <ul>{listItems}</ul>;
  }




  