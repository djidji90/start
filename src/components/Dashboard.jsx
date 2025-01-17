import React, { useEffect, useState } from 'react';
import { fetchProtectedData } from '../components/api';

const Dashboard = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProtectedData();
        setData(response.data);
      } catch (err) {
        setError('No autorizado o error al cargar datos');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {data ? <p>Datos: {data}</p> : <p>{error}</p>}
    </div>
  );
};

export default Dashboard;