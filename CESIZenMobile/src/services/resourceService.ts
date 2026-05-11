import api from './api';

export interface Resource {
    id: number;
    title: string;
    content: string;
    description: string;
    imageUrl?: string;
    category: string;
}

export const getResources = async (): Promise<Resource[]> => {
    try {
        const response = await api.get('/Resources'); // Vérifie bien le nom du contrôleur C#
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des ressources", error);
        throw error;
    }
};