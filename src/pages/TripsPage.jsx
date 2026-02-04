import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrips } from "../hooks/useTrips";
import { useTripActions } from "../hooks/useTripActions";
import { TripTable } from "../components/trips/TripTable";
import { TripControls } from "../components/trips/TripControls";
import { Modal } from "../components/ui/Modal";
// IMPORTANTE: Cambiamos CreateTripForm por TripForm
import { TripForm } from "../components/trips/TripForm";
import { AssignDriverModal } from "../components/trips/AssingnDriverModal";
import { Spinner } from "../components/ui/Spinner";
import { tripService } from "../services/trip.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const TripsPage = () => {
	const { user, isAdmin } = useAuth();
	const { trips, loading, error, refresh } = useTrips();
	const { assignState, openAssignModal, closeAssignModal } = useTripActions();

	// --- NUEVOS ESTADOS PARA EL MODAL UNIFICADO ---
	const [modalState, setModalState] = useState({
		isOpen: false,
		mode: "create", // 'create' | 'view'
		selectedTrip: null,
	});
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	const filteredTrips = useMemo(() => {
		return trips.filter((trip) => {
			const matchesSearch =
				trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
				trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(trip.client?.firstName || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter ? trip.status === statusFilter : true;
			return matchesSearch && matchesStatus;
		});
	}, [trips, searchTerm, statusFilter]);

	// --- HANDLERS DEL MODAL ---

	// 1. Abrir para CREAR (Botón +Solicitar)
	const handleOpenCreate = () => {
		setModalState({ isOpen: true, mode: "create", selectedTrip: null });
	};

	// 2. Abrir para VER (Solo lectura)
	const handleViewClick = (trip) => {
		/* setModalState({ isOpen: true, mode: "view", selectedTrip: trip }); */
		navigate(`/trips/${trip.id}`);
	};
	// 3. Abrir para EDITAR (Directo a edición)
	const handleEditClick = (trip) => {
		// Aquí podrías validar si el viaje es editable antes de abrir
		setModalState({ isOpen: true, mode: "edit", selectedTrip: trip });
	};
	const handleCloseModal = () => {
		setModalState((prev) => ({ ...prev, isOpen: false }));
	};

	const handleSuccess = () => {
		handleCloseModal();
		refresh();
	};
	const handleAcknowledge = async (id) => {
		try {
			await tripService.acknowledgeTrip(id);
			toast.success("Confirmado");
			refresh();
		} catch (e) {
			toast.error("Error al confirmar");
		}
	};
	const handleStart = async (id) => {
		if (!window.confirm("¿Iniciar viaje?")) return;
		try {
			await tripService.startTrip(id);
			toast.success("Viaje iniciado");
			refresh();
		} catch (e) {
			toast.error("Error al iniciar");
		}
	};
	const handleUnload = async (id) => {
		if (!window.confirm("¿Confirmar descarga en destino?")) return;
		try {
			await tripService.unloadTrip(id);
			toast.success("Descarga registrada");
			refresh();
		} catch (e) {
			toast.error("Error");
		}
	};
	const handleReturn = async (id) => {
		if (!window.confirm("¿Confirmar devolución de contenedor (Playo)?")) return;
		try {
			await tripService.returnContainer(id);
			toast.success("Contenedor devuelto");
			refresh();
		} catch (e) {
			toast.error("Error");
		}
	};
	const handleInvoice = async (id) => {
		// MVP: Usamos un prompt nativo para pedir el monto rápido
		const amountStr = window.prompt("Ingrese el monto final del viaje:");
		if (!amountStr) return; // Cancelado

		const amount = parseFloat(amountStr);
		if (isNaN(amount)) {
			toast.error("Monto inválido");
			return;
		}

		try {
			await tripService.invoiceTrip(id, amount);
			toast.success("Viaje facturado y cerrado");
			refresh();
		} catch (e) {
			toast.error("Error al facturar");
		}
	};
	const handleExport = async () => {
		try {
			toast.loading("Generando Excel...");
			await tripService.exportToExcel({
				// Aquí podrías pasar filtros si quisieras exportar solo lo que se ve en pantalla
				// status: statusFilter
			});
			toast.dismiss();
			toast.success("Descarga iniciada");
		} catch (e) {
			toast.dismiss();
			toast.error("Error al exportar");
		}
	};
	// Handlers de acciones (Delete, Respond, Finish) se mantienen igual...
	const handleDelete = async (id) => {
		if (!window.confirm("¿Eliminar viaje?")) return;
		try {
			await tripService.deleteTrip(id);
			toast.success("Eliminado");
			refresh();
		} catch (e) {
			toast.error("Error al eliminar");
		}
	};

	return (
		<>
			<header className="mb-6">
				<h2 className="text-2xl font-bold text-dark">Gestión de Viajes</h2>
			</header>

			<TripControls
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				showCreateButton={isAdmin || user.role === "CLIENT"}
				onCreateClick={handleOpenCreate} // Usamos la nueva función
				onExportClick={handleExport}
			/>

			{loading && <Spinner />}
			{error && <div className="text-red-500">{error}</div>}

			{!loading && !error && (
				<TripTable
					trips={filteredTrips}
					onAssignClick={openAssignModal}
					onDeleteClick={handleDelete}
					onAcknowledge={handleAcknowledge}
					onStart={handleStart}
					onUnload={handleUnload}
					onReturn={handleReturn}
					onInvoice={handleInvoice}
					// AGREGAR ESTO EN TU COMPONENTE TripTable (ver nota abajo)
					onViewClick={handleViewClick}
					onEditClick={handleEditClick}
				/>
			)}

			{/* --- MODAL UNIFICADO --- */}
			<Modal
				isOpen={modalState.isOpen}
				onClose={handleCloseModal}
				title={
					modalState.mode === "create"
						? "Nuevo Viaje"
						: `Detalles del Viaje #${modalState.selectedTrip?.reference || ""}`
				}
			>
				<TripForm
					initialData={modalState.selectedTrip}
					initialMode={modalState.mode}
					onSuccess={handleSuccess}
				/>
			</Modal>

			{isAdmin && assignState.isOpen && (
				<AssignDriverModal
					isOpen={assignState.isOpen}
					onClose={closeAssignModal}
					tripId={assignState.tripId}
					onSuccess={() => {
						refresh();
						closeAssignModal();
					}}
				/>
			)}
		</>
	);
};
export default TripsPage;
