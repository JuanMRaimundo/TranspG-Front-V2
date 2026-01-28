import { useState } from 'react';
import { userService } from '../../services/user.service';
import toast from 'react-hot-toast';

// Recibimos 'onSuccess' para avisarle al padre cuando terminamos
export const CreateClientForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        await userService.createClient(formData);
        toast.success('Cliente creado correctamente');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        if (onSuccess) onSuccess();
    } catch (error) {
        toast.error(error.message || 'Error al crear cliente');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none" />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Inicial</label>
            <input required type="password" name="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand outline-none" />
        </div>

        <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 flex justify-center"
        >
            {isSubmitting ? 'Guardando...' : 'Crear Cliente'}
        </button>
    </form>
  );
};