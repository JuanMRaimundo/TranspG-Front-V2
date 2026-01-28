import { useState, useEffect } from 'react';
import { tripService } from '../../services/trip.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext'; // Para saber si es Admin
import { toast } from 'sonner';
import { Pencil, Save } from 'lucide-react';

// Helper para formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().slice(0, 16);
};

export const TripForm = ({ onSuccess, initialData = null, initialMode = 'create' }) => {
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'create' | 'view' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    pickupDate: '',
    cargoDetails: '',
    containerNumber: '',
    reference: '',
    expirationDate: '',
    notes: '',
    targetClientId: ''
  });

  // Cargar Clientes (solo si es necesario)
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await userService.getClients();
        setClients(data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    if (isAdmin) loadClients();
  }, [isAdmin]);

  // Cargar datos iniciales si estamos en View/Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        origin: initialData.origin || '',
        destination: initialData.destination || '',
        // Formateamos las fechas para que el input las lea bien
        pickupDate: formatDateForInput(initialData.pickupDate),
        expirationDate: formatDateForInput(initialData.expirationDate),
        cargoDetails: initialData.cargoDetails || '',
        containerNumber: initialData.containerNumber || '',
        reference: initialData.reference || '',
        notes: initialData.notes || '',
        targetClientId: initialData.clientId || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await tripService.createTrip(formData);
        toast.success('Viaje creado correctamente');
      } else if (mode === 'edit') {
        // Asumiendo que tripService.updateTrip existe y recibe (id, data)
        await tripService.updateTrip(initialData.id, formData);
        toast.success('Viaje actualizado correctamente');
      }
      
      if (onSuccess) onSuccess(); 
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ¿Los campos están deshabilitados?
  const isDisabled = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Botón de Editar para Admin (Solo aparece en modo View) */}
      {isAdmin && mode === 'view' && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className="flex items-center gap-2 text-sm text-brand font-bold hover:underline"
          >
            <Pencil size={16} />
            Habilitar Edición
          </button>
        </div>
      )}

      {/* Select de Cliente (Solo Admin puede cambiarlo o verlo si es create) */}
      {isAdmin && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Cliente</label>
          <select 
            required 
            name="targetClientId" 
            onChange={handleChange} 
            value={formData.targetClientId}
            disabled={isDisabled || (mode === 'edit' && initialData)} // A veces no queremos que cambien el dueño al editar
            className="w-full border p-2 rounded bg-white disabled:bg-slate-100"
          >
            <option value="">Seleccione un cliente...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-slate-700">Origen</label>
           <input required name="origin" value={formData.origin} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700">Destino</label>
           <input required name="destination" value={formData.destination} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
        </div>
      </div>
      
      <div>
         <label className="block text-sm font-medium text-slate-700">Fecha de Retiro</label>
         <input required type="datetime-local" name="pickupDate" value={formData.pickupDate} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
      </div>

      <div>
         <label className="block text-sm font-medium text-slate-700">Detalles de Carga</label>
         <textarea required name="cargoDetails" value={formData.cargoDetails} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" rows="3"></textarea>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-slate-700">N° Conteiner</label>
           <input required name="containerNumber" value={formData.containerNumber} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700">N° Referencia</label>
           <input required name="reference" value={formData.reference} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
        </div>
      </div>

      <div>
         <label className="block text-sm font-medium text-slate-700">Vencimiento</label>
         <input type="datetime-local" name="expirationDate" value={formData.expirationDate} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" />
      </div>

      <div>
         <label className="block text-sm font-medium text-slate-700">Notas</label>
         <textarea name="notes" value={formData.notes} onChange={handleChange} disabled={isDisabled} className="w-full border p-2 rounded disabled:bg-slate-100" rows="2"></textarea>
      </div>

      {/* Botón de Guardar (Solo visible si NO estamos en modo View) */}
      {mode !== 'view' && (
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 flex justify-center gap-2"
        >
          <Save size={20} />
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Viaje' : 'Guardar Cambios'}
        </button>
      )}
    </form>
  );
};