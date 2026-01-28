import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { connectSocket, disconnectSocket } from '../../services/socket';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export const MainLayout = () => {
  const navigate = useNavigate();
  const socketInitialized = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (socketInitialized.current) return;
    // 1. Conectar Socket
    const socket = connectSocket();

    if (socket) {
      socketInitialized.current = true;
      // --- LIMPIEZA PREVIA ---
      // Quitamos listeners viejos para no tener duplicados (x2, x3 alertas)
      socket.off("new_trip_request");
      socket.off("driver_rejected");
      socket.off("trip_offer");
      socket.off("trip_status");
      socket.off("trip_updated");
      socket.off("server:trip-status-change");
      // --- A. EVENTOS PARA EL ADMIN ---
      
     //  ADMIN - CLIENTE 
     socket.on("new_trip_request", (data) => {
      if (user && data.creatorId === user.id) return;
      toast.info(`Nuevo Viaje Solicitado`, {
        description:`Ref: ${data.reference} | Origen: ${data.origin}`,
        action: { label: 'Ver', onClick: () => navigate(`/trips`) }
      });
    });
    // 2. ADMIN - RECHAZO
    socket.on("driver_rejected", (data) => {
      toast.error("¡Chofer rechazó viaje!", {
        description: data.message 
    });
    });

    //  ASIGNACIÓN CHOFER
    socket.on("trip_offer", (data) => {
      toast.success("¡Nueva Oferta de Viaje!", {
        description: `Ruta: ${data.origin} -> ${data.destination}`,
        duration: 10000,
        action: { label: 'Ver', onClick: () => navigate(`/daily`) }
      });
    });

    // 3. CLIENTE - ESTADO
    socket.on("trip_status", (data) => {
      const text = data.message || `El estado de tu viaje cambió a ${data.status}`;
        toast.success("Actualización de Viaje", {
            description: text
        });
    });

    // 4. GENERAL
    socket.on("server:trip-status-change", (data) => {
      if (data.status === 'CANCELLED') {
        toast.error("Viaje Cancelado", { description: data.message });
    } else {
        toast.info(data.message);
    }
 });
  }

  // OJO: NO desconectamos el socket en el return del useEffect.
  // Solo queremos desconectar cuando el usuario hace LOGOUT explícito.
  // Si desconectamos aquí, cada vez que cambias de página dentro del layout, se cortaría.
  
}, [navigate, user]);// Agregamos navigate a dependencias
  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* El Sidebar vive aquí, UNA sola vez para toda la app */}
      <Sidebar />

      {/* Contenedor del contenido cambiante */}
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {/* AQUÍ es donde React Router inyectará la página que corresponda */}
        <Outlet /> 
      </main>
      
    </div>
  );
};