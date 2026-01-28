import { useState, useMemo } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips'; 
import { useTripActions } from '../hooks/useTripActions'; 
import { TripTable } from '../components/trips/TripTable';
import { TripControls } from '../components/trips/TripControls'; 
import { Modal } from '../components/ui/Modal';
// IMPORTANTE: Cambiamos CreateTripForm por TripForm
import { TripForm } from '../components/trips/TripForm'; 
import { AssignDriverModal } from '../components/trips/AssingnDriverModal';
import { Spinner } from '../components/ui/Spinner';
import { tripService } from '../services/trip.service';
import { toast } from 'sonner';

const TripsPage = () => {
  const { user, isAdmin } = useAuth();
  const { trips, loading, error, refresh } = useTrips();
  const { assignState, openAssignModal, closeAssignModal } = useTripActions();
  
  // --- NUEVOS ESTADOS PARA EL MODAL UNIFICADO ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'view'
    selectedTrip: null
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesSearch = 
        trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.client?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter ? trip.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [trips, searchTerm, statusFilter]); 

  // --- HANDLERS DEL MODAL ---
  
  // 1. Abrir para CREAR (Botón +Solicitar)
  const handleOpenCreate = () => {
    setModalState({ isOpen: true, mode: 'create', selectedTrip: null });
  };

  // 2. Abrir para VER (Click en la fila de la tabla)
  // IMPORTANTE: Tienes que pasar esta función a tu TripTable
  const handleRowClick = (trip) => {
    setModalState({ isOpen: true, mode: 'view', selectedTrip: trip });
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSuccess = () => {
    handleCloseModal();
    refresh();
  };

  // Handlers de acciones (Delete, Respond, Finish) se mantienen igual...
  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar viaje?")) return;
    try { await tripService.deleteTrip(id); toast.success("Eliminado"); refresh(); }
    catch(e) { toast.error("Error al eliminar"); }
  };
  // ... resto de handlers (handleResponse, handleFinish) ...
  // (Pegalos aquí igual que en tu código original)
  
  const handleResponse = async (id, status) => {
     try { await tripService.respondTrip(id, status); toast.success("Estado actualizado"); refresh(); }
     catch(e) { toast.error("Error"); }
  };
  const handleFinish = async (id) => {
    if(!window.confirm("¿Confirmas que has entregado la carga y deseas FINALIZAR el viaje?")) return;
    try {
        await tripService.finishTrip(id); 
        toast.success("¡Viaje Finalizado!");
        refresh(); 
    } catch (error) { toast.error("Error al finalizar el viaje"); }
  };

  return (
    <>
      <header className="mb-6">
          <h2 className="text-2xl font-bold text-dark">Gestión de Viajes</h2>
      </header>

      <TripControls 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showCreateButton={isAdmin || user.role === 'CLIENT'}
        onCreateClick={handleOpenCreate} // Usamos la nueva función
      />

      {loading && <Spinner />}
      {error && <div className="text-red-500">{error}</div>}
      
      {!loading && !error && (
        <TripTable 
            trips={filteredTrips} 
            onAssignClick={openAssignModal}
            onDeleteClick={handleDelete}
            onResponseClick={handleResponse}
            onFinishClick={handleFinish}
            // AGREGAR ESTO EN TU COMPONENTE TripTable (ver nota abajo)
            onRowClick={handleRowClick} 
        />
      )}

      {/* --- MODAL UNIFICADO --- */}
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={handleCloseModal} 
        title={modalState.mode === 'create' ? "Nuevo Viaje" : `Detalles del Viaje #${modalState.selectedTrip?.reference || ''}`}
      >
        <TripForm 
            initialData={modalState.selectedTrip}
            initialMode={modalState.mode}
            onSuccess={handleSuccess} 
        />
      </Modal>

      {isAdmin && assignState.isOpen && (
        <AssignDriverModal 
            isOpen={assignState.isOpen} onClose={closeAssignModal} 
            tripId={assignState.tripId} onSuccess={() => { refresh(); closeAssignModal(); }} 
        />
      )}
    </>
  );
};
export default TripsPage;