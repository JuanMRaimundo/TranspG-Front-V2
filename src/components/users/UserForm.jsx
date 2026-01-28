// src/components/users/UserForm.jsx
import { useState, useEffect } from 'react';
import { Spinner } from '../ui/Spinner';

export const UserForm = ({ initialData = {}, onSubmit, isLoading, buttonLabel = "Guardar" }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '', // Solo relevante en creación
    ...initialData // Sobreescribe con datos si es edición
  });

  // Efecto para actualizar si initialData llega tarde (asincronía)
  useEffect(() => {
    if (initialData.id) {
        setFormData(prev => ({ ...prev, ...initialData, password: '' })); // Password no se edita aquí
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       {/* ... Inputs de Nombre, Apellido, Email, Teléfono igual que antes ... */}
       
       {/* El password solo se muestra si NO hay ID (es creación) */}
       {!initialData.id && (
           <div>
               <label>Contraseña</label>
               <input type="password" name="password" onChange={handleChange} required />
           </div>
       )}

       <button type="submit" disabled={isLoading} className="btn-primary w-full">
           {isLoading ? <Spinner /> : buttonLabel}
       </button>
    </form>
  );
};