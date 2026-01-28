// src/components/ui/Card.jsx
export const Card = ({ children, className = "" }) => {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow ${className}`}>
        {children}
      </div>
    );
  };