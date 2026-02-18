import { useState, useEffect, useCallback } from "react";
import { tripService } from "../services/trip.service";
import { connectSocket } from "../services/socket"; // <--- 1. Importamos tu servicio

// 2. Agregamos el parámetro enableSocket (por defecto false para no gastar recursos)
export const useTrips = (enableSocket = false) => {
	const [trips, setTrips] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Agregamos isBackgroundRefresh para que no muestre el spinner gigante al actualizar
	const loadTrips = useCallback(async (isBackgroundRefresh = false) => {
		try {
			// Solo ponemos loading true si NO es una actualización de fondo
			if (!isBackgroundRefresh) setLoading(true);

			const data = await tripService.getSortedTrips("pickupDate", "DESC");
			setTrips(data);
		} catch (err) {
			setError(err.message);
		} finally {
			if (!isBackgroundRefresh) setLoading(false);
		}
	}, []);

	// Carga inicial (Montaje)
	useEffect(() => {
		loadTrips();
	}, [loadTrips]);

	// --- 3. LA MAGIA DEL SOCKET ---
	useEffect(() => {
		if (!enableSocket) return;

		// Usamos tu función connectSocket() que devuelve la instancia existente
		const socket = connectSocket();

		if (!socket) return; // Por seguridad, si no hay token no hace nada

		console.log("🟢 Hook useTrips escuchando cambios...");

		// Esta función se ejecuta cuando el backend grita "trips:refresh"
		const handleRefresh = (data) => {
			console.log("⚡ Actualización recibida:", data);

			// Aquí está la clave: Recargamos los datos "en silencio" (true)
			loadTrips(true);
		};

		// Suscripción al evento
		socket.on("trips:refresh", handleRefresh);

		// Limpieza: Al salir de la pantalla, dejamos de escuchar para no duplicar llamadas
		return () => {
			socket.off("trips:refresh", handleRefresh);
		};
	}, [enableSocket, loadTrips]);

	return { trips, loading, error, refresh: () => loadTrips(false) };
};
