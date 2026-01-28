import { API_URL, getHeaders } from './api';

export const authService = {
    // 1. Función para Iniciar Sesión
    login: async (email, password) => {
        try {
            // Hacemos la petición POST al backend
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(), // Usamos nuestros headers
                body: JSON.stringify({ email, password }) // Convertimos datos a JSON
            });

            // Si el backend responde con error (ej: 401 Credenciales inválidas)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al iniciar sesión');
            }

            // Si todo salió bien, obtenemos el token y el usuario
            const data = await response.json();
            
            // IMPORTANTE: Guardamos el token en el navegador para no perder la sesión al recargar
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error; // Lanzamos el error para que lo maneje la pantalla de Login
        }
    },

    // 2. Función para Cerrar Sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // 3. Función auxiliar para obtener el usuario actual guardado
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};