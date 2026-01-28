import { Search, Filter, Plus, ChevronDown } from 'lucide-react';

export const TripControls = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange,
  onCreateClick, 
  showCreateButton = false 
}) => {
  return (
    // 1. EL CONTENEDOR (Card blanca con sombra suave)
    <div className="bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
      
      {/* 2. ZONA DE BÚSQUEDA Y FILTROS (Agrupados) */}
      <div className="flex flex-col md:flex-row w-full md:w-auto gap-3 flex-1">
        
        {/* A. Buscador Estilizado */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar origen, destino, cliente..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand/20 rounded-xl text-sm font-medium text-dark outline-none transition-all focus:ring-4 focus:ring-brand/10 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* B. Filtro de Estado (Con flecha custom) */}
        <div className="relative w-full md:w-56 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
            <Filter size={16} />
          </div>
          
          {/* Select con 'appearance-none' para quitar flecha fea del navegador */}
          <select 
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand/20 rounded-xl text-sm font-medium text-slate-600 outline-none appearance-none cursor-pointer transition-all focus:ring-4 focus:ring-brand/10"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="WAITING_DRIVER">Esperando Chofer</option>
            <option value="CONFIRMED">Confirmados</option>
            <option value="IN_PROGRESS">En Curso</option>
            <option value="FINISHED">Finalizados</option>
            <option value="REJECTED">Rechazados</option>
          </select>

          {/* Nuestra propia flecha (ChevronDown) a la derecha */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown size={14} />
          </div>
        </div>

      </div>

      {/* 3. BOTÓN DE ACCIÓN (Separado a la derecha) */}
      {showCreateButton && (
        <div className="w-full md:w-auto">
          <button 
            type="button"
            onClick={onCreateClick}
            className="w-full md:w-auto bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <div className="bg-white/20 p-1 rounded-md">
                <Plus size={16} strokeWidth={3} />
            </div>
            <span>Nuevo Viaje</span>
          </button>
        </div>
      )}

    </div>
  );
};