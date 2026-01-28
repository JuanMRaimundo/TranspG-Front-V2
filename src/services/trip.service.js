import { API_URL, getHeaders } from './api';

export const tripService = {
  getTripById: async (tripId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Error al obtener el viaje');
    return await response.json();
},
  getAll: async () => {
    const response = await fetch(`${API_URL}/trips`, {
      method: 'GET',
      headers: getHeaders(), // Esto inyecta el token automáticamente
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar viajes');
    }
    
    // El backend devuelve { success: true, data: [...] } o directamente el array.
    // Ajustaremos esto según tu respuesta del backend.
    // Asumiré que tu backend devuelve directamente el array o un objeto con .data
    const data = await response.json();
    return data.data || data; 
  },
  getSortedTrips:async(sortBy = 'pickupDate', sortDir = 'DESC')=>{
    const response = await fetch(`${API_URL}/trips?sortBy=${sortBy}&sortDir=${sortDir}`,{
      method:'GET',
      headers:getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al cargar viajes ordenados');
}

const data = await response.json();
return data.data || data; 
  },
  createTrip: async (tripData) => {
    const response = await fetch(`${API_URL}/trips/request`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tripData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear viaje');
    return data;
},
updateTrip: async (id, tripData) => {
  const response = await fetch(`${API_URL}/trips/${id}`, {
      method: 'PUT', // O PATCH, según tu backend
      headers: getHeaders(),
      body: JSON.stringify(tripData)
  });
  if (!response.ok) throw new Error('Error al actualizar el viaje');
  return await response.json();
},
  assignDriver: async (tripId, driverId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}/assign`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ driverId })
    });
    if (!response.ok) throw new Error('Error al asignar chofer');
    return await response.json();
  },
  respondTrip: async (tripId, action) => {
    // status debe ser 'CONFIRMED' (Aceptar) o 'REJECTED' (Rechazar)
   
    const response = await fetch(`${API_URL}/trips/${tripId}/responseDriver`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ responseDriver: action })
    });
    
    if (!response.ok) throw new Error('Error al responder solicitud');
    return await response.json();
  },
  finishTrip: async (tripId) => {
    const response = await fetch(`${API_URL}/trips/${tripId}/finish`, {
        method: 'POST', // O PUT, depende de tu gusto
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Error al finalizar el viaje');
    return await response.json();
},
cancelTrip: async (tripId, action) => {
  // status debe ser 'CONFIRMED' (Aceptar) o 'REJECTED' (Rechazar)
 
  const response = await fetch(`${API_URL}/trips/${tripId}/cancel`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ cancel: action })
  });
  
  if (!response.ok) throw new Error('Error al responder solicitud');
  return await response.json();
},

  // Aquí agregaremos create() y update() más adelante
};