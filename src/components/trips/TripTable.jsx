import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/Badge";
import { RowActions } from "../ui/RowActions";
import {
	UserPlus,
	Check,
	Play,
	PackageCheck,
	Anchor,
	DollarSign,
	Box,
} from "lucide-react";

export const TripTable = ({
	trips,
	onViewClick,
	onEditClick,
	onAssignClick,
	onDeleteClick,
	// Acciones de flujo
	onAcknowledge,
	onStart,
	onUnload,
	onReturn,
	onInvoice,
}) => {
	const { user, isAdmin } = useAuth();
	const isDriver = user.role === "DRIVER";
	const isClient = user.role === "CLIENT";

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
							<th className="px-6 py-4">Estado</th>
							<th className="px-6 py-4">Fecha</th>
							<th className="px-6 py-4">Ruta</th>
							{!isClient && <th className="px-6 py-4">Cliente</th>}
							{!isDriver && <th className="px-6 py-4">Chofer</th>}

							{/* --- 1. SEMI (A la derecha del chofer) --- */}
							<th className="px-6 py-4">Semi</th>

							{/* --- 2. CARGA / CONTENEDOR (Unificados) --- */}
							<th className="px-6 py-4">Carga / Cont.</th>

							<th className="px-6 py-4 text-right">Acciones</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{trips.map((trip) => (
							<tr key={trip.id} className="hover:bg-slate-50 transition-colors">
								{/* 1. Estado */}
								<td className="px-6 py-4">
									<Badge status={trip.status} />
								</td>

								{/* 2. Fecha */}
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex flex-col">
										<span className="text-sm font-medium text-slate-700">
											{new Date(
												trip.pickupDate || trip.createdAt,
											).toLocaleDateString()}
										</span>
										<span className="text-xs text-slate-400">
											{new Date(
												trip.pickupDate || trip.createdAt,
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								</td>

								{/* 3. Ruta */}
								<td className="px-6 py-4">
									<div className="flex flex-col gap-1 max-w-[200px]">
										<span className="text-xs text-slate-600 truncate">
											Origen: <b>{trip.origin}</b>
										</span>
										<span className="text-xs text-slate-600 truncate">
											Destino: <b>{trip.destination}</b>
										</span>
									</div>
								</td>

								{/* 4. Cliente */}
								{!isClient && (
									<td className="px-6 py-4 text-sm text-slate-600">
										{trip.client
											? `${trip.client.firstName} ${trip.client.lastName}`
											: "-"}
									</td>
								)}

								{/* 5. Chofer */}
								{!isDriver && (
									<td className="px-6 py-4 text-sm">
										{trip.driver ? (
											<div className="flex items-center gap-1">
												<span className="font-medium text-slate-700">
													{trip.driver.firstName}
												</span>
												{trip.driverAcknowledged && (
													<Check
														size={14}
														className="text-green-500"
														title="Chofer enterado"
													/>
												)}
											</div>
										) : (
											<span className="text-slate-400 italic text-xs">
												Sin asignar
											</span>
										)}
									</td>
								)}

								{/* --- 6. SEMI (Siempre visible y obligatorio) --- */}
								<td className="px-6 py-4 text-sm font-bold text-slate-700">
									{trip.semi}
								</td>

								{/* --- 7. CARGA Y CONTENEDOR --- */}
								<td className="px-6 py-4">
									<div className="flex flex-col gap-1.5 max-w-[200px]">
										{/* Detalle de Carga */}
										<span
											className="text-sm text-slate-600 truncate"
											title={trip.cargoDetails}
										>
											{trip.cargoDetails}
										</span>

										{/* Bloque Contenedor (Solo si existe) */}
										{trip.containerNumber ? (
											<div className="flex flex-col bg-slate-50 p-1.5 rounded border border-slate-100">
												<div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
													<Box size={12} />
													<span>{trip.containerNumber}</span>
												</div>
												{/* Lugar de devolución en letra chica abajo */}
												{trip.returnPlace && (
													<span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
														Dev: {trip.returnPlace}
													</span>
												)}
											</div>
										) : (
											// Opcional: Mostrar que es carga suelta
											<span className="text-[10px] text-slate-400 italic">
												Carga Suelta
											</span>
										)}
									</div>
								</td>

								{/* 8. ACCIONES */}
								<td className="px-6 py-4 text-right">
									<div className="flex justify-end items-center gap-2">
										{/* A. ADMIN: ASIGNAR */}
										{isAdmin && trip.status === "PENDING" && (
											<button
												type="button"
												onClick={() => onAssignClick(trip.id)}
												className="p-1.5 text-brand hover:bg-brand/10 rounded"
												title="Asignar Chofer"
											>
												<UserPlus size={18} />
											</button>
										)}

										{/* B. CHOFER: CONFIRMAR LECTURA */}
										{isDriver &&
											trip.status === "CONFIRMED" &&
											!trip.driverAcknowledged && (
												<button
													type="button"
													onClick={() => onAcknowledge(trip.id)}
													className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1 text-xs font-bold px-2"
													title="Marcar como Leído"
												>
													<Check size={14} /> OK
												</button>
											)}

										{/* C. CHOFER: INICIAR VIAJE */}
										{isDriver &&
											trip.status === "CONFIRMED" &&
											trip.driverAcknowledged && (
												<button
													type="button"
													onClick={() => onStart(trip.id)}
													className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1 text-xs font-bold px-2"
													title="Comenzar Viaje"
												>
													<Play size={14} /> INICIO
												</button>
											)}

										{/* D. CHOFER: DESCARGAR */}
										{isDriver && trip.status === "IN_PROGRESS" && (
											<button
												type="button"
												onClick={() => onUnload(trip.id)}
												className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center gap-1 text-xs font-bold px-2"
												title="Marcar como Descargado"
											>
												<PackageCheck size={14} /> DESCARGADO
											</button>
										)}

										{/* E. CHOFER: PLAYO (Solo si tiene container) */}
										{isDriver &&
											trip.status === "UNLOADED" &&
											trip.containerNumber && (
												<button
													type="button"
													onClick={() => onReturn(trip.id)}
													className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 flex items-center gap-1 text-xs font-bold px-2"
													title="Contenedor Devuelto"
												>
													<Anchor size={14} /> PLAYO
												</button>
											)}

										{/* F. ADMIN: FACTURAR */}
										{isAdmin &&
											((trip.status === "UNLOADED" && !trip.containerNumber) ||
												trip.status === "RETURNED") && (
												<button
													type="button"
													onClick={() => onInvoice(trip.id)}
													className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 flex items-center gap-1 text-xs font-bold px-2"
													title="Facturar"
												>
													<DollarSign size={14} /> $$
												</button>
											)}

										<RowActions
											id={trip.id}
											resource="trips"
											onDelete={isAdmin ? onDeleteClick : undefined}
											onView={() => onViewClick(trip)}
											onEdit={() => onEditClick(trip)}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
