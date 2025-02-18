import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import gitge from '../../../../assets/imagenes/pato.jpg';


const MusicEventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.imageContainer}>
        <img
          src={event.image || gitge}
          alt={event.title}
          className={styles.image}
          loading="lazy"
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.date}>
          {new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className={styles.location}>{event.location}</p>
      </div>
    </article>
  );
};

MusicEventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

export default MusicEventCard;