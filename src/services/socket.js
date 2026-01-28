import io from 'socket.io-client';
import { API_URL } from './api'; // Asegúrate de que apunte a tu base URL (ej: localhost:3000)

let socket;

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // 1. Si el socket ya existe y está conectado (o conectando), lo devolvemos tal cual.
  // Esto evita que React cree 20 conexiones por segundo.
  if (socket && (socket.connected || socket.connecting)) {
    console.log("♻️ Usando conexión de socket existente");
    return socket;
  }

  // 2. Si no existe, creamos uno nuevo
  // NOTA: Usa solo el dominio, sin /api/v1. Si tu API_URL tiene /api/v1, quítaselo aquí.
  // Ejemplo: si API_URL es 'http://localhost:3000/api/v1', pon 'http://localhost:3000'
  const baseUrl = 'http://localhost:3000'; 

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'], // Forzar websocket es más estable
    reconnection: true,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Limpiamos la variable para permitir reconexión futura (Logout)
  }
};