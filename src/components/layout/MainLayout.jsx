import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { connectSocket, disconnectSocket } from "../../services/socket";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, CheckCircle2, MapPin, Pencil, Truck } from "lucide-react";

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
			socket.off("trip_offer");
			socket.off("trip_ack");
			socket.off("trip_status");
			socket.off("trip_status_update");
			socket.off("trip_edited");
			// --- A. EVENTOS PARA EL ADMIN ---

			// 1. Nuevo Viaje Creado (Por un cliente)
			socket.on("new_trip_request", (data) => {
				// Si yo fui el creador, no me notifiques
				if (user && data.creatorId === user.id) return;

				toast("Nuevo Pedido de Viaje", {
					description: `Ref: ${data.reference} | Origen: ${data.origin}`,
					icon: <MapPin className="text-brand" />,
					action: {
						label: "Ver Detalles",
						onClick: () => navigate(`/trips/${data.tripId}`),
					},
				});
			});

			// 2. Chofer dió el "OK" (Lectura confirmada)
			socket.on("trip_ack", (data) => {
				toast.success("Chofer Enterado", {
					description: `${data.driverName} confirmó la lectura del viaje.`,
					icon: <CheckCircle2 className="text-green-500" />,
				});
			});
			// 3. Actualización Operativa (Inicio, Descarga, Playo)
			socket.on("trip_status_update", (data) => {
				// data.message viene del backend: "El viaje hacia X ha comenzado"
				toast.info("Actualización de Viaje", {
					description: data.message,
					icon: <Truck className="text-blue-500" />,
				});
			});

			// B. EVENTOS PARA EL CHOFER
			// 1. Te asignaron un viaje
			socket.on("trip_offer", (data) => {
				toast("¡Nuevo Viaje Asignado!", {
					description: `Origen: ${data.origin} -> Destino: ${data.destination}`,
					duration: Infinity, // Se queda fijo hasta que lo cierre o toque
					icon: <Truck className="text-brand" />,
					action: {
						label: "Ver Ahora",
						onClick: () => navigate(`/trips/${data.tripId}`),
					},
				});
			});

			// C. EVENTOS PARA EL CLIENTE
			// 1. Cambios de estado (En camino, Llegó, Facturado, etc)
			socket.on("trip_status", (data) => {
				// Filtramos: Si soy Admin, ignoro este evento (porque ya recibo trip_status_update)
				// para no tener doble notificación si el admin se auto-asigna cosas.
				if (user && user.role === "ADMIN") return;

				// Definimos iconos según estado
				let Icon = Truck;
				if (data.status === "INVOICED") Icon = CheckCircle2;
				if (data.status === "PENDING") Icon = AlertCircle;

				toast.message("Estado de tu Viaje", {
					description: data.message,
					icon: <Icon className="text-slate-600" />,
				});
			});
			//EDICIÓN DE VIAJE (Para TODOS)
			socket.on("trip_edited", (data) => {
				toast.info("Viaje Modificado", {
					description: data.message,
					icon: <Pencil className="text-amber-500" />,
					// Al hacer click, vamos a la nueva página de detalles
					action: {
						label: "Ver Cambios",
						onClick: () => navigate(`/trips/${data.tripId}`),
					},
				});
			});
		}
	}, [navigate, user]); // Dependencias

	return (
		<div className="flex min-h-screen bg-slate-50">
			<Sidebar />
			<main className="flex-1 ml-64 p-8 transition-all duration-300">
				<Outlet />
			</main>
		</div>
	);
};
