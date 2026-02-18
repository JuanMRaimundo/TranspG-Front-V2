import { AlertTriangle, Banknote, X } from "lucide-react";
import { useEffect, useState } from "react";

export const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	isDestructive = false, // Si es true, el botón será ROJO
	isLoading = false,
	showInput = false,
	inputPlaceholder = "Ingrese el monto de la factura...",
}) => {
	const [inputValue, setInputValue] = useState("");

	// Limpiamos el input cada vez que se abre el modal
	useEffect(() => {
		if (isOpen) setInputValue("");
	}, [isOpen]);
	if (!isOpen) return null;
	const handleConfirm = () => {
		// Si hay input, pasamos el valor. Si no, pasamos undefined.
		onConfirm(showInput ? inputValue : undefined);
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden transform transition-all scale-100">
				{/* Cuerpo del Mensaje */}
				<div className="p-6 text-center">
					{/* Ícono Dinámico: Si es input (factura) usamos Billete, sino Alerta */}
					<div
						className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
							isDestructive ? "bg-red-100" : "bg-blue-100"
						}`}
					>
						{showInput ? (
							<Banknote className="h-6 w-6 text-blue-600" />
						) : (
							<AlertTriangle
								className={`h-6 w-6 ${
									isDestructive ? "text-red-600" : "text-blue-600"
								}`}
							/>
						)}
					</div>

					<h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
					<p className="text-sm text-slate-500">{message}</p>
					{/* --- ACA MOSTRAMOS EL INPUT DE SER NECESARIO--- */}
					{showInput && (
						<div className="mt-2">
							<input
								type="number"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder={inputPlaceholder}
								className="w-full p-3 border border-slate-300 rounded-lg text-center text-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
								autoFocus
							/>
						</div>
					)}
				</div>

				{/* Botones */}
				<div className="flex border-t border-slate-100 bg-slate-50 p-4 gap-3">
					<button
						onClick={onClose}
						disabled={isLoading}
						className="flex-1 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium text-sm transition-colors"
					>
						{cancelText}
					</button>

					<button
						onClick={handleConfirm}
						disabled={isLoading}
						className={`flex-1 px-4 py-2 text-white rounded-lg font-medium text-sm shadow-sm transition-colors flex justify-center items-center gap-2
              ${
								isDestructive
									? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
									: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
							} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
					>
						{isLoading ? "Procesando..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};
