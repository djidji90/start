import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useMusicEvents } from '../hook/useMusicEvents.jsx'


const MusicEventDetail = () => {
  const { id } = useParams();
  const { data: event, loading, error } = useMusicEvents(id);

  if (loading) return <div className={styles.loading}>Cargando detalles...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{event.title}</h1>
      <div className={styles.content}>
        <img
          src={event.image || '/default-event-image.jpg'}
          alt={event.title}
          className={styles.mainImage}
        />
        <div className={styles.details}>
          <p className={styles.date}>
            Fecha: {new Date(event.date).toLocaleDateString()}
          </p>
          <p className={styles.location}>Lugar: {event.location}</p>
          <p className={styles.description}>{event.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MusicEventDetail;