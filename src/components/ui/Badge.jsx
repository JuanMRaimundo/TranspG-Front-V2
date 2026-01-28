export const Badge = ({ status }) => {
  const config = {
    WAITING_DRIVER: {
      label: 'ESPERANDO CHOFER',
      sub: '(Propuesta enviada)',
      style: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    PENDING: {
      label: 'PENDIENTE',
      sub: '(Sin asignar)',
      style: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    CONFIRMED: {
      label: 'CONFIRMADO',
      sub: '(Chofer asignado)',
      style: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    IN_PROGRESS: {
      label: 'EN CURSO',
      sub: '(En tránsito)',
      style: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    FINISHED: {
      label: 'FINALIZADO',
      sub: '(Entregado)',
      style: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    REJECTED: {
      label: 'RECHAZADO',
      sub: '(Cancelado)',
      style: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    DEFAULT: {
      label: status,
      sub: '',
      style: 'bg-slate-50 text-slate-500'
    }
  };

  const { label, sub, style } = config[status] || config.DEFAULT;

  return (
    <div className="flex flex-col items-start">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${style}`}>
        {label}
      </span>
      {/* Renderizamos el subtítulo solo si existe */}
      {sub && <span className="text-[10px] text-slate-400 mt-0.5 font-medium">{sub}</span>}
    </div>
  );
};