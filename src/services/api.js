// Aquí definimos la URL base de tu backend.
// Si mañana subes tu API a la nube, SOLO cambias esta línea.
export const API_URL = 'http://localhost:3000/api/v1';

// Función auxiliar para obtener los headers estándar
export const getHeaders = () => {
    const token = localStorage.getItem('token'); // Recuperamos el token si existe
    return {
        'Content-Type': 'application/json',
        // Si hay token, lo agregamos como Bearer. Si no, mandamos string vacío.
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};