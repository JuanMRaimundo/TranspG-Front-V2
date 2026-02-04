import { useState, useEffect } from "react";
import { tripService } from "../../services/trip.service";
import { userService } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext"; // Para saber si es Admin
import { toast } from "sonner";
import { Pencil, Save, Truck, Box } from "lucide-react";

// Helper para formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
const formatDateForInput = (isoString) => {
	if (!isoString) return "";
	return new Date(isoString).toISOString().slice(0, 16);
};

export const TripForm = ({
	onSuccess,
	initialData = null,
	initialMode = "create",
}) => {
	const { isAdmin } = useAuth();
	const [mode, setMode] = useState(initialMode); // 'create' | 'view' | 'edit'
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [clients, setClients] = useState([]);

	// Estado del formulario
	const [formData, setFormData] = useState({
		origin: "",
		destination: "",
		pickupDate: "",
		cargoDetails: "",
		reference: "",
		notes: "",
		targetClientId: "",
		semi: "",
		containerNumber: "",
		expirationDate: "",
		returnPlace: "",
	});

	// Cargar Clientes (solo si es necesario)
	useEffect(() => {
		const loadClients = async () => {
			try {
				const data = await userService.getClients();
				setClients(data);
			} catch (error) {
				console.error("Error cargando clientes:", error);
			}
		};
		if (isAdmin) loadClients();
	}, [isAdmin]);

	// Cargar datos iniciales si estamos en View/Edit
	useEffect(() => {
		if (initialData) {
			setFormData({
				origin: initialData.origin || "",
				destination: initialData.destination || "",
				pickupDate: formatDateForInput(initialData.pickupDate),
				expirationDate: formatDateForInput(initialData.expirationDate),
				cargoDetails: initialData.cargoDetails || "",
				containerNumber: initialData.containerNumber || "",
				reference: initialData.reference || "",
				notes: initialData.notes || "",
				targetClientId: initialData.clientId || "",
				semi: initialData.semi || "",
				returnPlace: initialData.returnPlace || "",
			});
		}
	}, [initialData]);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const dataToSubmit = { ...formData };
			if (!dataToSubmit.containerNumber) {
				dataToSubmit.containerNumber = null;
				dataToSubmit.expirationDate = null;
				dataToSubmit.returnPlace = null;
			}
			if (mode === "create") {
				await tripService.createTrip(dataToSubmit);
				toast.success("Viaje creado correctamente");
			} else if (mode === "edit") {
				// Asumiendo que tripService.updateTrip existe y recibe (id, data)
				await tripService.updateTrip(initialData.id, dataToSubmit);
				toast.success("Viaje actualizado correctamente");
			}

			if (onSuccess) onSuccess();
		} catch (error) {
			toast.error("Error: " + error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ¿Los campos están deshabilitados?
	const isDisabled = mode === "view";
	const hasContainer =
		formData.containerNumber && formData.containerNumber.trim() !== "";

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Botón de Editar para Admin (Solo aparece en modo View) */}
			{isAdmin && mode === "view" && (
				<div className="flex justify-end mb-2">
					<button
						type="button"
						onClick={() => setMode("edit")}
						className="flex items-center gap-2 text-sm text-brand font-bold hover:underline"
					>
						<Pencil size={16} />
						Habilitar Edición
					</button>
				</div>
			)}

			{/* Select de Cliente (Solo Admin puede cambiarlo o verlo si es create) */}
			{isAdmin && (
				<div>
					<label className="block text-sm font-medium text-slate-700">
						Cliente
					</label>
					<select
						required
						name="targetClientId"
						onChange={handleChange}
						value={formData.targetClientId}
						disabled={isDisabled || (mode === "edit" && initialData)} // A veces no queremos que cambien el dueño al editar
						className="w-full border p-2 rounded bg-white disabled:bg-slate-100"
					>
						<option value="">Seleccione un cliente...</option>
						{clients.map((client) => (
							<option key={client.id} value={client.id}>
								{client.firstName} {client.lastName}
							</option>
						))}
					</select>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-slate-700">
						Origen
					</label>
					<input
						required
						name="origin"
						value={formData.origin}
						onChange={handleChange}
						disabled={isDisabled}
						className="w-full border p-2 rounded disabled:bg-slate-100"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-slate-700">
						Destino
					</label>
					<input
						required
						name="destination"
						value={formData.destination}
						onChange={handleChange}
						disabled={isDisabled}
						className="w-full border p-2 rounded disabled:bg-slate-100"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-slate-700">
						Fecha de Retiro
					</label>
					<input
						required
						type="datetime-local"
						name="pickupDate"
						value={formData.pickupDate}
						onChange={handleChange}
						disabled={isDisabled}
						className="w-full border p-2 rounded disabled:bg-slate-100"
					/>
				</div>
				<div>
					{/* SEMI OBLIGATORIO */}
					<label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
						<Truck size={14} /> Semi / Patente
					</label>
					<input
						required
						name="semi"
						value={formData.semi}
						onChange={handleChange}
						disabled={isDisabled}
						placeholder="Ej: AA-123-BB"
						className="w-full border p-2 rounded disabled:bg-slate-100"
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-slate-700">
					Detalles de Carga
				</label>
				<textarea
					required
					name="cargoDetails"
					value={formData.cargoDetails}
					onChange={handleChange}
					disabled={isDisabled}
					className="w-full border p-2 rounded disabled:bg-slate-100"
					rows="3"
				></textarea>
			</div>

			{/* --- SECCIÓN 4: CONTENEDOR (Lógica Condicional) --- */}
			<div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
				<div className="grid grid-cols-2 gap-4 mb-3">
					<div>
						<label className="block text-sm font-medium text-slate-700 flex items-center gap-1">
							<Box size={14} /> N° Contenedor{" "}
							<span className="text-slate-400 font-normal text-xs">
								(Opcional)
							</span>
						</label>
						<input
							name="containerNumber"
							value={formData.containerNumber}
							onChange={handleChange}
							disabled={isDisabled}
							placeholder="Dejar vacío si es carga suelta"
							className="w-full border p-2 rounded disabled:bg-slate-100"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-slate-700">
							N° Referencia
						</label>
						<input
							required
							name="reference"
							value={formData.reference}
							onChange={handleChange}
							disabled={isDisabled}
							className="w-full border p-2 rounded disabled:bg-slate-100"
						/>
					</div>
				</div>

				{/* CAMPOS DEPENDIENTES: Solo aparecen si hay contenedor escrito */}
				{hasContainer && (
					<div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
						<div>
							<label className="block text-sm font-medium text-blue-700">
								Vencimiento Contenedor
							</label>
							<input
								type="datetime-local"
								name="expirationDate"
								value={formData.expirationDate}
								onChange={handleChange}
								disabled={isDisabled}
								required // Se vuelve requerido si hay contenedor
								className="w-full border border-blue-200 bg-white p-2 rounded disabled:bg-slate-100 focus:ring-blue-200"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-blue-700">
								Lugar de Devolución
							</label>
							<input
								name="returnPlace"
								value={formData.returnPlace}
								onChange={handleChange}
								disabled={isDisabled}
								required // Se vuelve requerido si hay contenedor
								placeholder="Depósito / Terminal"
								className="w-full border border-blue-200 bg-white p-2 rounded disabled:bg-slate-100 focus:ring-blue-200"
							/>
						</div>
					</div>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium text-slate-700">
					Notas
				</label>
				<textarea
					name="notes"
					value={formData.notes}
					onChange={handleChange}
					disabled={isDisabled}
					className="w-full border p-2 rounded disabled:bg-slate-100"
					rows="2"
				></textarea>
			</div>

			{/* Botón de Guardar (Solo visible si NO estamos en modo View) */}
			{mode !== "view" && (
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 flex justify-center gap-2"
				>
					<Save size={20} />
					{isSubmitting
						? "Guardando..."
						: mode === "create"
							? "Crear Viaje"
							: "Guardar Cambios"}
				</button>
			)}
		</form>
	);
};
