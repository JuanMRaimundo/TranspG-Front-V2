import { useState } from 'react';
import { useClients } from '../hooks/useClients';
import { Modal } from '../components/ui/Modal';
import { CreateClientForm } from '../components/users/CreateClientForm';
import { Spinner } from '../components/ui/Spinner'; 
import { User, Phone, Mail, Plus, EditIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RowActions } from '../components/ui/RowActions';

const ClientsPage = () => {
  // 1. El hook nos da todo listo: datos, carga y función para refrescar
  const { clients, loading, error, refresh } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-dark">Gestión de Clientes</h2>
           <p className="text-slate-500 text-sm">Administra tus Clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </header>

      {/* Manejo de Estados */}
      {loading && <Spinner text="Cargando clientes..." />}
      {error && <div className="text-rose-500 bg-rose-50 p-4 rounded">{error}</div>}

      {/* Lista de Clientes (Solo si no carga y no hay error) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No hay clientes registrados.</p>}
            
            {clients.map(client => (
                <div key={client.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={24} />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-dark truncate">{client.firstName} {client.lastName}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 truncate">
                            <Mail size={14} className="shrink-0" /> {client.email}
                        </div>
                        {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 truncate">
                                <Phone size={14} className="shrink-0" /> {client.phone}
                            </div>
                        )}
                        {/* <Link to={`/users/edit/${client.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          >
                            <EditIcon size={18} />
                              </Link> */}
                        <span className="inline-block mt-3 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 font-medium">
                            Activo
                        </span>
                        <RowActions 
                             id={client.id} 
                            resource="clients"
                           onDelete /* = {handleDeleteDriver}  */
                              // Solo Admin borra
                    
                  />
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal: Solo contiene el Formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Cliente"
      >
        <CreateClientForm onSuccess={() => {
            setIsModalOpen(false); 
            refresh(); 
        }} />
      </Modal>
    </div>
  );
};

export default ClientsPage;