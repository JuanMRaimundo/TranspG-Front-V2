import { useTrips } from '../../hooks/useTrips';
import { Card } from '../ui/Card';
import {Badge} from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { tripService } from '../../services/trip.service';

export const TripList = ({ trips: propsTrips }) => {
  const { trips: hookTrips, loading: hookLoading, error: hookError } = useTrips();
  const trips = propsTrips || hookTrips;
  const loading = propsTrips ? false : hookLoading;
  const error = propsTrips ? null : hookError;
  const { user } = useAuth();

  const handleResponse = async (tripId, status) => {
    try {
      // status: 'CONFIRMED' o 'REJECTED'
      await tripService.respondTrip(tripId, status);
      toast.success(status === 'CONFIRMED' ? '¡Viaje Aceptado!' : 'Viaje Rechazado');
      if (onActionSuccess) onActionSuccess(); // Recargar lista
    } catch (error) {
      toast.error('Error al procesar solicitud');
    }
  };

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p className="mt-4 text-sm text-slate-400">Sincronizando flota...</p>
      </div>
    );
  }

  // 2. Estado de Error
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-center text-sm">
        <p className="font-semibold">No se pudieron cargar los viajes.</p>
        <p>{error}</p>
      </div>
    );
  }

  // 3. Estado Vacío
  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No hay viajes registrados</p>
        <p className="text-slate-400 text-sm mt-1">Las solicitudes nuevas aparecerán aquí.</p>
      </div>
    );
  }

  // 4. Renderizado de la Lista
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <Card key={trip.id}>
          
          {/* Cabecera: ID y Estado */}
          <div className="flex justify-between items-start mb-4">
            <Badge status={trip.status} />
            <span className="text-slate-400 text-xs font-mono bg-slate-50 px-2 py-1 rounded">
              {/* Formato de fecha corto */}
              {new Date(trip.createdAt || Date.now()).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit'
              })}
            </span>
          </div>

          {/* Ruta Visual */}
          <div className="relative pl-4 border-l-2 border-slate-100 space-y-4 mb-5">
            {/* Origen */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-brand border-2 border-white ring-1 ring-slate-100"></div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Origen</p>
              <p className="font-medium text-dark text-sm truncate">{trip.origin}</p>
            </div>

            {/* Destino */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-dark border-2 border-white ring-1 ring-slate-100"></div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Destino</p>
              <p className="font-medium text-dark text-sm truncate">{trip.destination}</p>
            </div>
          </div>

          {/* Footer: Detalles de Carga */}
          <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
            <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 uppercase font-bold">Carga</span>
               <span className="text-xs text-slate-600 font-medium truncate max-w-[150px]">
                 {trip.cargoDetails || 'Sin detalles'}
               </span>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-50">
            
            {/* LOGICA CHOFER: Aceptar / Rechazar */}
            {user.role === 'DRIVER' && trip.status === 'WAITING_DRIVER' ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => handleResponse(trip.id, 'CONFIRMED')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors shadow-sm shadow-emerald-200"
                >
                  <Check size={16} /> Aceptar
                </button>
                <button 
                  onClick={() => handleResponse(trip.id, 'REJECTED')}
                  className="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-rose-200 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                >
                  <X size={16} /> Rechazar
                </button>
              </div>
            ) : (
              /* Vista normal para otros casos */
              <div className="flex flex-col">
                 {/* ... detalles de carga ... */}
              </div>
            )}
        
          </div>  
            
            {/* Botón discreto para futura funcionalidad */}
            <button className="text-xs text-brand hover:text-brand-dark font-semibold transition-colors">
              Ver más →
            </button>
          </div>

        </Card>
      ))}
    </div>
  );
};