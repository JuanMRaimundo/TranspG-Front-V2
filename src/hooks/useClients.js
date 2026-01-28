import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast'; 

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);


  return { clients, loading, error, refresh: loadClients };
};