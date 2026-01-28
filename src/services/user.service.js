import { API_URL, getHeaders } from './api';

export const userService = {
    getUserById: async(id)=>{
        const response = await fetch(`${API_URL}/users/${id}`,{
            headers:getHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const data = await response.json();
        return data.data;
    },
    getDrivers: async () => {
        const response = await fetch(`${API_URL}/users/drivers`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar choferes');
        const data = await response.json();
        return data.data;
    },
    getClients: async()=>{
        const response =await fetch(`${API_URL}/users/clients`,{
            headers:getHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar clientes');
        const data = await response.json();
        return data.data;
    },

    createDriver: async (driverData) => {
        const response = await fetch(`${API_URL}/users/drivers`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(driverData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al crear chofer');
        return data;
    },
    createClient: async(clientData)=>{
        const response = await fetch(`${API_URL}/users/clients`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(clientData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al crear cliente');
        return data;
    },
    updateUser: async(userData,id)=>{
        const response = await fetch(`${API_URL}/users/:${id}/update`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al actualizar usuario');
        return data;
    },
    deleteUser: async (id) => {
        const response = await fetch(`${API_URL}/users/${id}/delete`, { method: 'DELETE', headers: getHeaders() });
        if (!response.ok) throw new Error('Error al eliminar');
        return await response.json();
    },
};




