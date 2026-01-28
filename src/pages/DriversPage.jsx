import { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { Modal } from '../components/ui/Modal';
import { CreateDriverForm } from '../components/users/CreateDriverForm';
import { Spinner } from '../components/ui/Spinner'; 
import { User, Phone, Mail, Plus,Edit3Icon } from 'lucide-react';
import { RowActions } from '../components/ui/RowActions';

const DriversPage = () => {
  // 1. El hook nos da todo listo: datos, carga y función para refrescar
  const { drivers, loading, error, refresh } = useDrivers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleDeleteDriver = async (driverId) => {
    // 1. Confirmación (Modal nativo simple por ahora)
    if (!window.confirm("¿Estás seguro de eliminar este chofer? Esta acción es lógica (Soft Delete).")) {
        return;
    }

    try {
        // 2. Llamada al servicio
        await userService.deleteUser(driverId);
        toast.success("Chofer eliminado correctamente");
        
        // 3. Recargar la lista visualmente
        refresh();
    } catch (error) {
        console.error(error);
        toast.error("Error al eliminar chofer");
    }
  };

 
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-dark">Gestión de Choferes</h2>
           <p className="text-slate-500 text-sm">Administra tu flota de conductores.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Nuevo Chofer
        </button>
      </header>

      {/* Manejo de Estados */}
      {loading && <Spinner text="Cargando flota..." />}
      {error && <div className="text-rose-500 bg-rose-50 p-4 rounded">{error}</div>}

      {/* Lista de Choferes (Solo si no carga y no hay error) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No hay choferes registrados.</p>}
            
            {drivers.map(driver => (
                <div key={driver.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={24} />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-dark truncate">{driver.firstName} {driver.lastName}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 truncate">
                            <Mail size={14} className="shrink-0" /> {driver.email}
                        </div>
                        {driver.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 truncate">
                                <Phone size={14} className="shrink-0" /> {driver.phone}
                            </div>
                        )}
                        <div className='flex justify-between items-center gap-2  '>
                        <span className="inline-block mt-3 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium">
                            Activo
                        </span>
                      
                        </div>  
                        <RowActions 
                             id={driver.id} 
                            resource="users"
                            onDelete = {handleDeleteDriver}
                              // Solo Admin borra
                    
                  />
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal: Solo contiene el Formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Chofer"
      >
        <CreateDriverForm onSuccess={() => {
            setIsModalOpen(false); // Cerramos modal
            refresh(); // Refrescamos la lista automáticamente
        }} />
      </Modal>
    </div>
  );
};

export default DriversPage;