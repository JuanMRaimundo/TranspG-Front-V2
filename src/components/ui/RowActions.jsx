import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';

/**
 * @param {string} id - El ID del elemento
 * @param {string} resource - El nombre del recurso
 * @param {function} onDelete - Función para eliminar
 * @param {function} onEdit - (NUEVO) Función para editar (abrir modal)
 * @param {function} onView - Función para ver (abrir modal)
 */
export const RowActions = ({ id, resource, onDelete, onEdit, onView }) => {
  const navigate = useNavigate();

  const handleEdit = (e) => {
    e.preventDefault(); // Evita recarga
    e.stopPropagation(); // Evita clic en la fila
    
    if (onEdit) {
      onEdit(id); // Si pasamos función (abrir modal), úsala
    } else {
      navigate(`/${resource}/edit/${id}`); // Si no, navegación clásica
    }
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onView) {
      onView(id);
    } else {
      navigate(`/${resource}/${id}`);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      
      {/* 1. Botón VER */}
      <button 
        type="button" 
        onClick={handleView}
        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Ver detalles"
      >
        <Eye size={18} />
      </button>

      {/* 2. Botón EDITAR */}
      <button 
        type="button" 
        onClick={handleEdit}
        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        title="Editar"
      >
        <Pencil size={18} />
      </button>

      {/* 3. Botón ELIMINAR */}
      {onDelete && (
        <button 
          type="button" 
          onClick={handleDelete}
          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};