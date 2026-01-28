import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, Users, Truck, LogOut, Package, Briefcase,List,Calendar } from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Definimos los items del menú según el rol
  const adminItems = [
   /*  { label: 'Panel de Control', icon: LayoutDashboard, path: '/' },
    { label: 'Viajes', icon: Briefcase, path: '/trips' }, */
    { label: 'Todos los Viajes', icon: List, path: '/' },
    { label: 'Viajes del Día', icon: Calendar, path: '/daily' },
    { label: 'Gestionar Choferes', icon: Truck, path: '/users/drivers' },   
    { label: 'Gestionar Clientes', icon: Users, path: '/users/clients' },   
  ];

  const clientItems = [
    { label: 'Mis Viajes', icon: Package, path: '/' },
    { label: 'Solicitar Viaje', icon: PlusCircle, path: '/create-trip' },
  ];

  const driverItems = [
    { label: 'Mis Viajes', icon: Truck, path: '/' },
    { label: 'Viajes del Día', icon: Calendar, path: '/daily' },
  ];

  // Seleccionamos qué menú mostrar
  let items = clientItems;
  if (user?.role === 'ADMIN') items = adminItems;
  if (user?.role === 'DRIVER') items = driverItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-bg text-white flex flex-col z-40 border-r border-slate-800">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-8 border-b border-slate-800">
        <h1 className="text-xl font-bold text-brand tracking-tight">Transportes G</h1>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Perfil + Logout) */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-brand font-bold">
            {user?.firstName?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.firstName}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};