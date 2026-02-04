import { API_URL, getHeaders } from "./api";

export const tripService = {
	getTripById: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}`, {
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al obtener el viaje");
		const data = await response.json();
		return data.data || data;
	},
	getAll: async () => {
		const response = await fetch(`${API_URL}/trips`, {
			method: "GET",
			headers: getHeaders(), // Esto inyecta el token automáticamente
		});
		if (!response.ok) throw new Error("Error al cargar viajes");
		const data = await response.json();
		return data.data || data;
	},
	getSortedTrips: async (sortBy = "pickupDate", sortDir = "DESC") => {
		const response = await fetch(
			`${API_URL}/trips?sortBy=${sortBy}&sortDir=${sortDir}`,
			{
				method: "GET",
				headers: getHeaders(),
			},
		);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Error al cargar viajes ordenados");
		}

		const data = await response.json();
		return data.data || data;
	},
	createTrip: async (tripData) => {
		const response = await fetch(`${API_URL}/trips/request`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(tripData),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.message || "Error al crear viaje");
		return data;
	},
	updateTrip: async (id, tripData) => {
		const response = await fetch(`${API_URL}/trips/${id}`, {
			method: "PUT", // O PATCH, según tu backend
			headers: getHeaders(),
			body: JSON.stringify(tripData),
		});
		if (!response.ok) throw new Error("Error al actualizar el viaje");
		return await response.json();
	},
	assignDriver: async (tripId, driverId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/assign`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify({ driverId }),
		});
		if (!response.ok) throw new Error("Error al asignar chofer");
		return await response.json();
	},
	respondTrip: async (tripId, action) => {
		// status debe ser 'CONFIRMED' (Aceptar) o 'REJECTED' (Rechazar)

		const response = await fetch(`${API_URL}/trips/${tripId}/responseDriver`, {
			method: "PATCH",
			headers: getHeaders(),
			body: JSON.stringify({ responseDriver: action }),
		});

		if (!response.ok) throw new Error("Error al responder solicitud");
		return await response.json();
	},

	//--- NUEVO FLUJO DEL CHOFER ---/

	// 1. "Entendido / OK"
	acknowledgeTrip: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/acknowledge`, {
			method: "PUT",
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al confirmar lectura");
		return await response.json();
	},

	// 2. "Comenzar Viaje" (En Camino)
	startTrip: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/start`, {
			method: "PUT",
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al iniciar viaje");
		return await response.json();
	},

	// 3. "Descargado" (Llegó a destino)
	unloadTrip: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/unload`, {
			method: "PUT",
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al marcar descargado");
		return await response.json();
	},

	// 4. "Playo" (Devolvió contenedor - solo si aplica)
	returnContainer: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/return`, {
			method: "PUT",
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al marcar devolución");
		return await response.json();
	},

	// --- NUEVO FLUJO DEL ADMIN ---

	// 5. "Facturar" (Cerrar viaje con monto)
	invoiceTrip: async (tripId, amount) => {
		const response = await fetch(`${API_URL}/trips/${tripId}/invoice`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify({ amount }), // Enviamos el monto
		});
		if (!response.ok) throw new Error("Error al facturar viaje");
		return await response.json();
	},

	// --- EXPORTACIÓN ---
	exportToExcel: async (filters = {}) => {
		// Convertimos filtros a query string: ?status=PENDING&startDate=...
		const queryParams = new URLSearchParams(filters).toString();

		const response = await fetch(`${API_URL}/trips/export?${queryParams}`, {
			method: "GET",
			headers: {
				...getHeaders(), // Mantenemos token
				Accept:
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			},
		});

		if (!response.ok) throw new Error("Error al descargar Excel");

		// Truco para descargar archivo binario (Blob) desde el navegador
		const blob = await response.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `Reporte_Viajes_${new Date().toISOString().split("T")[0]}.xlsx`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	},

	deleteTrip: async (tripId) => {
		const response = await fetch(`${API_URL}/trips/${tripId}`, {
			// Ojo: DELETE suele ser /trips/:id
			method: "DELETE",
			headers: getHeaders(),
		});
		if (!response.ok) throw new Error("Error al eliminar");
		return await response.json();
	},
};
