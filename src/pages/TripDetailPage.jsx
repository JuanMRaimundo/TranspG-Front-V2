import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tripService } from "../services/trip.service";
import { Spinner } from "../components/ui/Spinner";
import { Badge } from "../components/ui/Badge";
import {
	ArrowLeft,
	Clock,
	User,
	MapPin,
	Truck,
	Box,
	Pencil,
	CheckCircle2,
	ArrowRight,
} from "lucide-react";

// 1. DICCIONARIO: TRADUCE LO QUE VIENE DEL BACK AL CASTELLANO
const FIELD_LABELS = {
	origin: "Origen",
	destination: "Destino",
	pickupDate: "Fecha de Retiro",
	cargoDetails: "Detalle Carga",
	semi: "Semi/Patente",
	containerNumber: "N° Contenedor",
	returnPlace: "Lugar Devolución",
	expirationDate: "Vencimiento Cont.",
	reference: "Referencia",
	notes: "Notas",
	targetClientId: "Cliente Asignado",
};

// 2. FORMATEADOR: LIMPIA FECHAS Y VALORES VACÍOS
const formatValue = (field, value) => {
	if (
		value === null ||
		value === undefined ||
		value === "N/A" ||
		value === ""
	) {
		return <span className="text-slate-400 italic text-xs">Vacío</span>;
	}
	// Detecta si es fecha y la formatea bonito
	const isDate =
		field.toLowerCase().includes("date") || field.toLowerCase().includes("at");
	if (isDate && !isNaN(Date.parse(value))) {
		return new Date(value).toLocaleString("es-AR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	return value;
};

export const TripDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [trip, setTrip] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadTrip = async () => {
			try {
				const data = await tripService.getTripById(id);
				setTrip(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		loadTrip();
	}, [id]);

	if (loading) return <Spinner />;
	if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
	if (!trip) return <div className="p-8">Viaje no encontrado</div>;

	return (
		<div className="max-w-4xl mx-auto pb-10">
			{/* --- HEADER --- */}
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => navigate(-1)}
					className="p-2 hover:bg-slate-100 rounded-full"
				>
					<ArrowLeft size={20} className="text-slate-600" />
				</button>
				<div>
					<h1 className="text-2xl font-bold text-dark flex items-center gap-3">
						Viaje Ref: {trip.reference || "S/N"} <Badge status={trip.status} />
					</h1>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* --- COLUMNA IZQUIERDA: DETALLES --- */}
				<div className="md:col-span-2 space-y-6">
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
							<MapPin size={18} className="text-brand" /> Ruta y Carga
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<span className="text-xs font-bold text-slate-400 uppercase">
									Origen
								</span>
								<p className="font-medium">{trip.origin}</p>
							</div>
							<div>
								<span className="text-xs font-bold text-slate-400 uppercase">
									Destino
								</span>
								<p className="font-medium">{trip.destination}</p>
							</div>
							<div className="md:col-span-2">
								<span className="text-xs font-bold text-slate-400 uppercase">
									Carga
								</span>
								<p>{trip.cargoDetails}</p>
							</div>
							<div>
								<span className="text-xs font-bold text-slate-400 uppercase">
									Semi
								</span>
								<p className="font-bold">{trip.semi}</p>
							</div>
							<div>
								<span className="text-xs font-bold text-slate-400 uppercase">
									Monto Facturado
								</span>
								<p className="font-bold">{trip.amount}</p>
							</div>
							{trip.containerNumber && (
								<div>
									<span className="text-xs font-bold text-slate-400 uppercase">
										Contenedor
									</span>
									<div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm font-bold">
										<Box size={14} className="inline mr-1" />{" "}
										{trip.containerNumber}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* --- HISTORIAL DE CAMBIOS (LIMPIO) --- */}
					<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
						<h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
							<Clock size={18} className="text-amber-500" /> Historial
						</h3>

						<div className="space-y-6 relative border-l-2 border-slate-100 ml-3 pl-6">
							{/* CREADO */}
							<div className="relative">
								<div className="absolute -left-[31px] bg-green-100 text-green-600 p-1.5 rounded-full border-2 border-white">
									<CheckCircle2 size={14} />
								</div>
								<p className="text-xs text-slate-400 font-bold">
									{new Date(trip.createdAt).toLocaleString("es-AR")}
								</p>
								<p className="font-medium text-slate-800">Viaje Creado</p>
							</div>

							{/* EDICIONES */}
							{trip.history?.map((hist) => (
								<div key={hist.id} className="relative">
									<div className="absolute -left-[31px] bg-amber-100 text-amber-600 p-1.5 rounded-full border-2 border-white">
										<Pencil size={14} />
									</div>

									<div className="flex justify-between mb-2">
										<span className="text-xs text-slate-400 font-bold uppercase">
											{new Date(hist.createdAt).toLocaleString("es-AR")}
										</span>
										<span className="text-xs bg-slate-100 px-2 rounded text-slate-600">
											Por: {hist.editor?.firstName || "Sistema"}
										</span>
									</div>

									<div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-200">
										{/* AQUI ESTA LA MAGIA: LEEMOS EL JSON */}
										{hist.changedFields && Array.isArray(hist.changedFields) ? (
											hist.changedFields.map((change, idx) => (
												<div
													key={idx}
													className="p-2 text-sm grid grid-cols-1 sm:grid-cols-2 gap-1"
												>
													{/* Usamos el DICCIONARIO para traducir */}
													<span className="font-bold text-slate-700">
														{FIELD_LABELS[change.field] || change.field}
													</span>
													<div className="flex items-center gap-2 text-slate-600">
														<span className="text-xs text-slate-400 line-through">
															{formatValue(change.field, change.oldValue)}
														</span>
														<ArrowRight size={12} />
														<span className="font-medium text-green-700">
															{formatValue(change.field, change.newValue)}
														</span>
													</div>
												</div>
											))
										) : (
											// Fallback para datos viejos
											<p className="p-3 text-xs italic text-slate-500">
												{hist.details}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* --- COLUMNA DERECHA: PERSONAS --- */}
				<div className="space-y-6">
					<div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
						<h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
							Cliente
						</h4>
						<p className="font-bold text-lg">
							{trip.client?.firstName} {trip.client?.lastName}
						</p>
					</div>
					<div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
						<h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
							Chofer
						</h4>
						<p className="font-bold text-lg">
							{trip.driver
								? `${trip.driver.firstName} ${trip.driver.lastName}`
								: "Sin asignar"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TripDetailPage;
