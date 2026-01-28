import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips'; 
import { useTripActions } from '../hooks/useTripActions';
import { TripTable } from '../components/trips/TripTable';
import { TripControls } from '../components/trips/TripControls'; 
import { AssignDriverModal } from '../components/trips/AssingnDriverModal';
import { Spinner } from '../components/ui/Spinner';
import { tripService } from '../services/trip.service';
import {toast} from 'sonner';

const DailyTripsPage = () => {
  const { isAdmin } = useAuth();
  const { trips, loading, error, refresh } = useTrips();
  const { assignState, openAssignModal, closeAssignModal } = useTripActions();

  // Estados de Filtros Locales
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // --- LÓGICA DE FILTRADO EN CADENA ---
  const displayedTrips = useMemo(() => {
    // 1. Primero filtramos por FECHA (La regla de oro de esta página)
    const today = new Date();
    const todayTrips = trips.filter(trip => {
        const rawDate = trip.pickupDate || trip.createdAt;
        if (!rawDate) return false;
        const tripDate = new Date(rawDate);
        return tripDate.getDate() === today.getDate() &&
               tripDate.getMonth() === today.getMonth() &&
               tripDate.getFullYear() === today.getFullYear();
    });

    // 2. Luego aplicamos los filtros de UI (Texto y Estado) sobre los de hoy
    return todayTrips.filter(trip => {
      const matchesSearch = 
        trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.client?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter ? trip.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  // Handlers (Igual que antes)
  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar viaje?")) return;
    try { await tripService.deleteTrip(id); toast.success("Eliminado"); refresh(); } 
    catch(e) { toast.error("Error"); }
  };

  const handleResponse = async (id, responseDriver) => {
     try { await tripService.respondTrip(id, responseDriver); toast.success("Estado actualizado"); refresh(); } 
     catch(e) { toast.error("Error al responder solicitud"); }
  };
  const handleFinish = async (id) => {
    if(!window.confirm("¿Confirmas que has entregado la carga y deseas FINALIZAR el viaje?")) return;

    try {
        // Asumiendo que agregaste 'finishTrip' en trip.service.js
        await tripService.finishTrip(id); 
        toast.success("¡Viaje Finalizado!");
        refresh(); // Recargamos para ver el cambio de estado
    } catch (error) {
        toast.error("Error al finalizar el viaje");
    }
  };

  return (
    <>
      <header className="mb-6">
          <h2 className="text-2xl font-bold text-dark">Viajes del Día</h2>
          <p className="text-slate-500 text-sm">
            {displayedTrips.length} operaciones visibles para hoy.
          </p>
      </header>

      {/* --- REUTILIZAMOS LOS MISMOS CONTROLES --- */}
      {/* Nota: Aquí no mostramos el botón de crear si no quieres, o puedes ponerlo en true */}
      <TripControls 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showCreateButton={false} // En la vista "Diaria" quizás solo queremos filtrar, no crear
      />

      {loading && <Spinner text="Cargando día..." />}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
          displayedTrips.length > 0 ? (
             <TripTable 
                trips={displayedTrips}
                onAssignClick={openAssignModal}   
                onDeleteClick={handleDelete}      
                onResponseClick={handleResponse} 
                onFinishClick={handleFinish} 
             />
          ) : (
             <div className="p-12 text-center border rounded-xl border-dashed border-slate-200 text-slate-500 bg-white">
                <p>No se encontraron viajes para hoy con esos filtros.</p>
             </div>
          )
      )}
      
      {isAdmin && assignState.isOpen && (
        <AssignDriverModal 
            isOpen={assignState.isOpen} onClose={closeAssignModal} 
            tripId={assignState.tripId} onSuccess={() => { refresh(); closeAssignModal(); }} 
        />
      )}
    </>
  );
};

export default DailyTripsPage;