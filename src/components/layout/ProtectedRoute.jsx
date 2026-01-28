import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Verificando sesión...</div>;

  // 1. Si no está logueado -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. (Opcional) Si hay roles específicos y el usuario no lo tiene -> Al Home o Error 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Por simplicidad, si no tiene permiso, lo mandamos al home
    return <Navigate to="/" replace />;
  }

  // 3. Si todo está bien, renderiza los hijos (en este caso, el MainLayout)
  return <Outlet />;
};