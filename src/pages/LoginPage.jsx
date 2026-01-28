import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Importamos useNavigate para redirigir al usuario tras el login
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    try {
      await login(email, password);
      navigate('/'); // Si todo sale bien, nos vamos al Dashboard (Home)
    } catch (err) {
      // El error viene del throw en auth.service.js
      setError(err.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Tarjeta del Login */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand mb-2">Transportes G</h1>
          <p className="text-slate-500">Ingresa a tu panel de control</p>
        </div>

        {/* Mensaje de Error (solo si existe) */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              placeholder="admin@transportes.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          ¿Olvidaste tu contraseña? Contacta a soporte.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;