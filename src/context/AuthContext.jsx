import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

// 1. Creamos el Contexto (la "nube" vacía)
const AuthContext = createContext();

// 2. Creamos el Proveedor (el componente que envuelve a la app)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para saber si estamos chequeando sesión

    // Al cargar la app, verificamos si ya hay sesión guardada
    useEffect(() => {
        const checkUser = () => {
            const savedUser = authService.getCurrentUser();
            if (savedUser) {
                setUser(savedUser);
            }
            setLoading(false); // Ya terminamos de chequear
        };
        checkUser();
    }, []);

    // Función Login (envuelve al servicio)
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user); // Actualizamos el estado global
    };

    // Función Logout
    const logout = () => {
        authService.logout();
        setUser(null); // Limpiamos el estado global
    };

    // Esto es lo que compartiremos con toda la app
    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user, // true si hay usuario, false si no
        isAdmin: user?.role === 'ADMIN', // helper rápido
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// 3. Hook personalizado para usar el contexto fácil (Esto es Clean Code)
export const useAuth = () => {
    return useContext(AuthContext);
};