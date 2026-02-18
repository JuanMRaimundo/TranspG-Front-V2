import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTrips } from "../hooks/useTrips";
import { useTripActions } from "../hooks/useTripActions";
import { TripTable } from "../components/trips/TripTable";
import { TripControls } from "../components/trips/TripControls";
import { AssignDriverModal } from "../components/trips/AssingnDriverModal";
import { Spinner } from "../components/ui/Spinner";
import { tripService } from "../services/trip.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/ui/Modal";
import { TripForm } from "../components/trips/TripForm";
import { useTripOperations } from "../hooks/useTripOperations";
import { ConfirmModal } from "../components/ui/ConfirmModal";

const DailyTripsPage = () => {
	const { isAdmin } = useAuth();
	//UseTrips en TRUE Por el Socket
	const { trips, loading, error, refresh } = useTrips(true);
	const { assignState, openAssignModal, closeAssignModal } = useTripActions();
	const { confirmModalState, requestAction, confirmAction, closeConfirmModal } =
		useTripOperations(refresh);
	// Estados de Filtros Locales
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [modalState, setModalState] = useState({
		isOpen: false,
		mode: "create", // 'create' | 'view'
		selectedTrip: null,
	});
	const navigate = useNavigate();

	// --- LÓGICA DE FILTRADO EN CADENA ---
	const displayedTrips = useMemo(() => {
		// 1. Primero filtramos por FECHA (La regla de oro de esta página)
		const today = new Date();
		const todayTrips = trips.filter((trip) => {
			const rawDate = trip.pickupDate || trip.createdAt;
			if (!rawDate) return false;
			const tripDate = new Date(rawDate);
			return (
				tripDate.getDate() === today.getDate() &&
				tripDate.getMonth() === today.getMonth() &&
				tripDate.getFullYear() === today.getFullYear()
			);
		});

		// 2. Luego aplicamos los filtros de UI (Texto y Estado) sobre los de hoy
		return todayTrips.filter((trip) => {
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

	// Handlers (Igual que antes)
	const handleViewClick = (trip) => {
		navigate(`/trips/${trip.id}`);
	};
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
	const handleAcknowledge = async (tripId) => {
		try {
			await tripService.acknowledgeTrip(tripId);
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
				<h2 className="text-2xl font-bold text-dark">Viajes del Día</h2>
				<p className="text-slate-500 text-sm">
					{displayedTrips.length} operaciones visibles para hoy.
				</p>
			</header>

			{/* --- REUTILIZAMOS LOS MISMOS CONTROLES --- */}
			{/* Nota: Aquí no mostramos el botón de crear si no quieres, o puedes ponerlo en true */}
			<TripControls
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				onExportClick={handleExport}
				showCreateButton={false} // En la vista "Diaria" quizás solo queremos filtrar, no crear
			/>

			{loading && <Spinner text="Cargando día..." />}
			{error && <div className="text-red-500">{error}</div>}

			{!loading &&
				!error &&
				(displayedTrips.length > 0 ? (
					<TripTable
						trips={displayedTrips}
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
				) : (
					<div className="p-12 text-center border rounded-xl border-dashed border-slate-200 text-slate-500 bg-white">
						<p>No se encontraron viajes para hoy con esos filtros.</p>
					</div>
				))}
			<Modal
				isOpen={modalState.isOpen}
				onClose={handleCloseModal}
				title={
					modalState.mode === "edit"
						? "Editar viaje"
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

export default DailyTripsPage;
