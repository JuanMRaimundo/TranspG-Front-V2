import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrips } from "../hooks/useTrips";
import { useTripActions } from "../hooks/useTripActions";
import { TripTable } from "../components/trips/TripTable";
import { TripControls } from "../components/trips/TripControls";
import { Modal } from "../components/ui/Modal";
import { TripForm } from "../components/trips/TripForm";
import { AssignDriverModal } from "../components/trips/AssingnDriverModal";
import { Spinner } from "../components/ui/Spinner";
import { tripService } from "../services/trip.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTripOperations } from "../hooks/useTripOperations";
import { ConfirmModal } from "../components/ui/ConfirmModal";

const TripsPage = () => {
	const { user, isAdmin } = useAuth();
	const { trips, loading, error, refresh } = useTrips();
	const { assignState, openAssignModal, closeAssignModal } = useTripActions();
	const { confirmModalState, requestAction, confirmAction, closeConfirmModal } =
		useTripOperations(refresh);

	// --- NUEVOS ESTADOS PARA EL MODAL UNIFICADO ---
	const [modalState, setModalState] = useState({
		isOpen: false,
		mode: "create",
		selectedTrip: null,
	});
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	const filteredTrips = useMemo(() => {
		return trips.filter((trip) => {
			const matchesSearch =
				trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
				trip.semi.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
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
					onAcknowledge={handleAcknowledge}
					onDeleteClick={(id) => requestAction("DELETE", id)}
					onStart={(id) => requestAction("START", id)}
					onUnload={(id) => requestAction("UNLOAD", id)}
					onReturn={(id) => requestAction("RETURN", id)}
					onInvoice={(id) => requestAction("INVOICE", id)}
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
			<ConfirmModal
				isOpen={confirmModalState.isOpen}
				onClose={closeConfirmModal}
				onConfirm={confirmAction}
				isLoading={confirmModalState.isLoading}
				title={confirmModalState.title}
				message={confirmModalState.message}
				confirmText={confirmModalState.confirmText}
				isDestructive={confirmModalState.isDestructive}
				showInput={confirmModalState.showInput}
				inputPlaceholder={confirmModalState.inputPlaceholder}
			/>

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
