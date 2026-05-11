import axios from 'axios';

const api = axios.create({
    // potentiellement à changer en focntion de la connection à swagger
    baseURL: import.meta.env.VITE_API_URL,
    /*headers: {
        'Content-Type': 'application/json',
    }*/
});

// Cet intercepteur ajoute automatiquement le Token à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;