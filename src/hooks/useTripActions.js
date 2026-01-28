import { useState, useCallback } from 'react';

export const useTripActions = () => {
  // Estado para controlar el Modal de Asignación
  const [assignState, setAssignState] = useState({
    isOpen: false,
    tripId: null,
  });

  // Función para ABRIR el modal (se la pasamos a la Tabla)
  const openAssignModal = useCallback((tripId) => {
    setAssignState({ isOpen: true, tripId });
  }, []);

  // Función para CERRAR el modal
  const closeAssignModal = useCallback(() => {
    setAssignState({ isOpen: false, tripId: null });
  }, []);

  // Retornamos todo lo que la página necesita
  return {
    assignState,
    openAssignModal,
    closeAssignModal
  };
};