import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast'; 

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error('Error al cargar choferes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  return { drivers, loading, error, refresh: loadDrivers };
};