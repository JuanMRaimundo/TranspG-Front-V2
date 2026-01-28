import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useDrivers } from '../../hooks/useDrivers'; 
import { tripService } from '../../services/trip.service';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';

export const AssignDriverModal = ({ isOpen, onClose, tripId, onSuccess }) => {
  const { drivers, loading: loadingDrivers } = useDrivers(); 
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedDriver) return toast.error('Debes seleccionar un chofer');
    
    setAssigning(true);
    try {
      await tripService.assignDriver(tripId, selectedDriver);
      toast.success('Chofer asignado correctamente');
      if (onSuccess) onSuccess(); 
      onClose();
      setSelectedDriver(''); 
    } catch (error) {
      toast.error(error.message || 'Error al asignar');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Conductor">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Selecciona el chofer para el viaje.</p>
        
        {loadingDrivers ? (
          <Spinner text="Cargando flota..." />
        ) : (
          <div className="grid gap-2 max-h-60 overflow-y-auto border p-2 rounded-lg">
            {drivers.map(driver => (
              <label 
                key={driver.id} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all 
                ${selectedDriver === driver.id ? 'border-brand bg-green-50 ring-1 ring-brand' : 'hover:bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="radio" 
                  name="driver" 
                  value={driver.id} 
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="accent-brand w-4 h-4"
                />
                <div>
                  <p className="font-medium text-dark text-sm">{driver.firstName} {driver.lastName}</p>
                  <p className="text-xs text-slate-400">{driver.email}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <button 
          onClick={handleAssign}
          disabled={assigning || loadingDrivers}
          className="w-full bg-brand text-white py-2 rounded-lg font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {assigning ? 'Asignando...' : 'Confirmar Asignación'}
        </button>
      </div>
    </Modal>
  );
};