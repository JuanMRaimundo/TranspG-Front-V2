export const Spinner = ({ text = "Cargando..." }) => (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-3"></div>
      <p className="text-slate-400 text-sm animate-pulse">{text}</p>
    </div>
  );