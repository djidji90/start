import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useMusicEvents } from '../hook/useMusicEvents.jsx'


const MusicEventForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const { data: initialData, loading } = useMusicEvents(id);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createOrUpdateEvent(formData, isEdit);
      navigate(isEdit ? `/events/${id}` : '/events');
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading && isEdit) return <div>Cargando datos del evento...</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Título:</label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Resto de campos del formulario */}
      
      <button type="submit" disabled={submitting} className={styles.submitButton}>
        {submitting ? 'Enviando...' : isEdit ? 'Actualizar Evento' : 'Crear Evento'}
      </button>
    </form>
  );
};

export default MusicEventForm;