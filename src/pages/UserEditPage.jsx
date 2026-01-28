// src/pages/UserEditPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/user.service';
import { UserForm } from '../components/users/UserForm';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const UserEditPage = () => {
  const { id } = useParams(); // Obtenemos ID de la URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Cargar datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUserById(id); // Necesitas crear este método en el servicio
        setUser(data);
      } catch (error) {
        toast.error("Error cargando usuario");
        navigate('/drivers'); // O a donde corresponda
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  // 2. Manejar la actualización
  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
        await userService.updateUser(id, formData); // Usamos el endpoint refactorizado
        toast.success("Legajo actualizado correctamente");
        navigate(-1); // Volver atrás
    } catch (error) {
        toast.error(error.message || "Error al actualizar");
    } finally {
        setSaving(false);
    }
  };

 
  if (loading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Spinner text="Cargando datos del usuario..." />
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
       <header className="mb-8 border-b pb-4">
           <h1 className="text-2xl font-bold text-dark">Editar Legajo: {user.firstName} {user.lastName}</h1>
           <p className="text-slate-500">Gestión de datos personales y contacto.</p>
       </header>
       
       <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           {/* Reutilizamos el formulario pasándole los datos */}
           <UserForm 
               initialData={user} 
               onSubmit={handleUpdate} 
               isLoading={saving}
               buttonLabel="Actualizar Legajo"
           />
       </div>

       {/* Aquí a futuro agregarás componentes como: <DocumentsList userId={id} /> */}
    </div>
  );
};

export default UserEditPage;