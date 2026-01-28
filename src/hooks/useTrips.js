import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/trip.service';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getSortedTrips('pickupDate', 'DESC');
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar viajes al montar el componente
  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  return { trips, loading, error, refresh: loadTrips };
};