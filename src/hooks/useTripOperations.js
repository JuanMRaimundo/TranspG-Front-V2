import { useState } from "react";
import { tripService } from "../services/trip.service";
import { toast } from "sonner";

// Configuración centralizada de textos y colores
const ACTION_CONFIG = {
	DELETE: {
		title: "¿Eliminar viaje?",
		message: "Esta acción es irreversible.",
		confirmText: "Eliminar",
		isDestructive: true,
		serviceFn: tripService.deleteTrip,
		successMsg: "Viaje eliminado correctamente",
	},
	START: {
		title: "Iniciar Viaje",
		message: "¿Confirmas el inicio de este viaje?",
		confirmText: "Iniciar",
		isDestructive: false,
		serviceFn: tripService.startTrip,
		successMsg: "El viaje ha comenzado",
	},
	UNLOAD: {
		title: "Confirmar Descarga",
		message: "¿Llegaste y pudiste dejar la carga?",
		confirmText: "Confirmar Descarga",
		isDestructive: false,
		serviceFn: tripService.unloadTrip,
		successMsg: "Descarga registrada",
	},
	RETURN: {
		title: "Devolución de Contenedor",
		message: "¿El contenedor vacío ya fue devuelto?",
		confirmText: "Confirmar Devolución",
		isDestructive: false,
		serviceFn: tripService.returnContainer,
		successMsg: "Contenedor devuelto",
	},
	ACKNOWLEDGE: {
		// A veces este no requiere modal, pero lo incluimos por si acaso
		title: "Confirmar Lectura",
		message: "¿Marcar viaje como leido?",
		confirmText: "Confirmar",
		isDestructive: false,
		serviceFn: tripService.acknowledgeTrip,
		successMsg: "Viaje confirmado",
	},
	INVOICE: {
		title: "Facturar Viaje",
		message: "Ingrese el monto final acordado para cerrar este viaje.",
		confirmText: "Facturar y Cerrar",
		isDestructive: false,
		serviceFn: tripService.invoiceTrip, // Asegúrate de que esta fn acepte (id, amount)
		successMsg: "Viaje facturado correctamente",
		requiresInput: true, // <--- FLAG IMPORTANTE
		inputPlaceholder: "$ 0.00",
	},
};

export const useTripOperations = (refreshCallback) => {
	const [loading, setLoading] = useState(false);
	const [modalState, setModalState] = useState({
		isOpen: false,
		type: null, // DELETE, START, etc.
		tripId: null,
		tripData: null, // Por si necesitas datos extra
	});

	// 1. Función para PEDIR la acción (Abre el modal)
	const requestAction = (type, trip) => {
		// Si la acción no requiere confirmación (ej: Invoice manual), manéjala aparte o aquí
		setModalState({
			isOpen: true,
			type,
			tripId: trip.id || trip, // Acepta el objeto trip o solo el ID
			tripData: trip,
		});
	};

	// 2. Función para CONFIRMAR la acción (Ejecuta la lógica)
	const confirmAction = async (inputValue) => {
		const { type, tripId } = modalState;
		const config = ACTION_CONFIG[type];

		if (!config || !tripId) return;

		setLoading(true);
		try {
			// SI REQUIERE INPUT, PASAMOS EL VALOR COMO SEGUNDO ARGUMENTO
			if (config.requiresInput) {
				if (typeof inputValue === "object" || !inputValue) {
					toast.error("Por favor ingrese un monto válido");
					setLoading(false);
					return;
				}
				const amount = parseFloat(inputValue);
				if (isNaN(amount)) {
					toast.error("El monto ingresado no es un número");
					setLoading(false);
					return;
				}
				await config.serviceFn(tripId, amount);
			} else {
				// Si no, comportamiento normal (solo ID)
				await config.serviceFn(tripId);
			}

			toast.success(config.successMsg);
			setModalState((prev) => ({ ...prev, isOpen: false }));
			if (refreshCallback) refreshCallback();
		} catch (error) {
			console.error(error);
			const msg = error.response?.data?.message || "Ocurrió un error";
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	const closeConfirmModal = () => {
		setModalState((prev) => ({ ...prev, isOpen: false }));
	};

	// Helper para obtener los textos actuales del modal según el tipo
	const currentConfig = ACTION_CONFIG[modalState.type] || {};

	return {
		// Estado para pasarle al Modal UI
		confirmModalState: {
			isOpen: modalState.isOpen,
			isLoading: loading,
			title: currentConfig.title,
			message: currentConfig.message,
			confirmText: currentConfig.confirmText,
			isDestructive: currentConfig.isDestructive,
			showInput: currentConfig.requiresInput,
			inputPlaceholder: currentConfig.inputPlaceholder,
		},
		// Funciones
		requestAction, // Usar en los botones de la tabla: requestAction('DELETE', id)
		confirmAction, // Usar en el botón "Sí" del modal
		closeConfirmModal, // Usar en el botón "Cancelar"
	};
};
