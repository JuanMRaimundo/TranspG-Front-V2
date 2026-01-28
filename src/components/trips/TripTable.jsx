import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { RowActions } from '../ui/RowActions'; // Tu componente de editar/borrar/ver
import { UserPlus, Check, X, Clock,Flag } from 'lucide-react';

export const TripTable = ({ trips,onRowClick, onAssignClick, onResponseClick, onDeleteClick, onFinishClick }) => {
  const { user, isAdmin } = useAuth();
  const isDriver = user.role === 'DRIVER';
  const isClient = user.role === 'CLIENT';

  // Lógica de ordenamiento (Más reciente primero)
  /* const sortedTrips = [...trips].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }); */

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Ruta</th>
              {/* Admin ve cliente y chofer. Cliente ve Chofer. Chofer ve Cliente. */}
              {!isClient && <th className="px-6 py-4">Cliente</th>}
              {!isDriver && <th className="px-6 py-4">Chofer</th>}
              <th className="px-6 py-4">Carga</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((trip) => (
              <tr key={trip.id} onClick={() => onRowClick && onRowClick(trip)}
               className="hover:bg-slate-50 transition-colors">
                
                {/* 1. Estado */}
                <td className="px-6 py-4"><Badge status={trip.status} /></td>

                {/* 2. Fecha */}
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {new Date(trip.pickupDate || trip.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(trip.pickupDate || trip.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </td>

                {/* 3. Ruta */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 max-w-[200px]">
                    <span className="text-xs text-slate-600 truncate">Origen: <b>{trip.origin}</b></span>
                    <span className="text-xs text-slate-600 truncate">Destino: <b>{trip.destination}</b></span>
                  </div>
                </td>

                {/* 4. Cliente (Oculto para el propio Cliente) */}
                {!isClient && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {trip.client ? `${trip.client.firstName} ${trip.client.lastName}` : '-'}
                    </td>
                )}

                {/* 5. Chofer (Oculto para el propio Chofer) */}
                {!isDriver && (
                    <td className="px-6 py-4 text-sm">
                        {trip.driver ? (
                            <span className="font-medium text-slate-700">{trip.driver.firstName} {trip.driver.lastName}</span>
                        ) : <span className="text-slate-400 italic">Sin asignar</span>}
                    </td>
                )}

                {/* 6. Carga */}
                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                    {trip.cargoDetails}
                </td>

                {/* 7. ACCIONES (Aquí aplicamos stopPropagation) */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  
                    {/* --- LOGICA ADMIN: Asignar --- */}
                    {isAdmin && trip.status === 'PENDING' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onAssignClick(trip.id); }} 
                        className="p-1.5 text-brand hover:bg-brand/10 rounded transition-colors" 
                        title="Asignar Chofer"
                      >
                        <UserPlus size={18} />
                      </button>
                    )}
                    
                    {isAdmin && trip.status === 'WAITING_DRIVER' && (
                      <div className="p-1.5 text-amber-500 cursor-help" title="Esperando respuesta del chofer">
                          <Clock size={18} className="animate-pulse" />
                      </div>
                    )}

                    {/* --- LOGICA CHOFER: Aceptar/Rechazar --- */}
                    {isDriver && trip.status === 'WAITING_DRIVER' && (
                      <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onResponseClick(trip.id, 'ACCEPT'); }} 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" 
                            title="Aceptar"
                          >
                              <Check size={18} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onResponseClick(trip.id, 'REJECT'); }} 
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" 
                            title="Rechazar"
                          >
                              <X size={18} />
                          </button>
                      </>
                    )}

                    {/* --- LOGICA CHOFER: Finalizar --- */}
                    {isDriver && (trip.status === 'CONFIRMED' || trip.status === 'IN_PROGRESS') && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onFinishClick(trip.id); }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Finalizar Viaje"
                        >
                          <Flag size={18} />
                        </button>
                    )}

                    {/* --- CRUD COMÚN --- */}
                    {/* Envolvemos RowActions para que sus clicks no abran el modal de la fila */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <RowActions 
                          id={trip.id} 
                          resource="trips"
                          onDelete={isAdmin ? onDeleteClick : undefined} 
                          onView={() => onRowClick(trip)} 
                          onEdit={() => onRowClick(trip)}
                          // Opcional: Si RowActions tiene un botón de "Ver/Ojo", puedes pasarle onRowClick
                          // onView={() => onRowClick(trip)} 
                        />
                    </div>
                    
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};