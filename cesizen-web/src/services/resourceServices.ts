import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/Resources`;

export interface Resource {
    id: number;
    title: string;
    description: string;
    category: string;
    content: string;
}

export const getResources = async (): Promise<Resource[]> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des ressources :", error);
        throw error;
    }

};

export const createResource = async (resource: Omit<Resource, 'id' | 'createdAt'>): Promise<Resource> => {
    try {
        // Note : On utilise Omit pour dire "On envoie tout SAUF l'id et la date" (gérés par le serveur)
        const response = await axios.post(API_URL, resource);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création :", error);
        throw error;
    }
};