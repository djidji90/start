import { useState, useEffect } from 'react';
import { api } from './apia';

export const useMusicEvents = (eventId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = eventId ? `/events/${eventId}/` : '/events/';
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const createOrUpdateEvent = async (eventData, isEdit = false) => {
    try {
      let response;
      if (isEdit) {
        response = await api.put(`/events/${eventData.id}/`, eventData);
      } else {
        response = await api.post('/events/', eventData);
      }
      return response.data;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return { data, loading, error, createOrUpdateEvent };
};