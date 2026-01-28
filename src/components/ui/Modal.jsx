import { X } from 'lucide-react'; // Asegúrate de tener instalado lucide-react

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay oscuro
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ">
      
      {/* Contenedor Blanco */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-dark">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable si es muy largo) */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>

      </div>
    </div>
  );
};