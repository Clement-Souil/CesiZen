import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface AuthUser {
    email: string;
    role: string;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthUser> {
        const response = await api.post('/users/login', { email, password });
        const { token, user, role } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userEmail', user);
        await AsyncStorage.setItem('userRole', role);

        return { email: user, role };
    },

    async register(email: string, password: string, displayName: string): Promise<void> {
        await api.post('/users/register', { email, password, displayName });
    },

    async logout(): Promise<void> {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userRole');
    },

    async getCurrentUser(): Promise<AuthUser | null> {
        const email = await AsyncStorage.getItem('userEmail');
        const role = await AsyncStorage.getItem('userRole');
        const token = await AsyncStorage.getItem('token');
        if (!email || !role || !token) return null;
        return { email, role };
    },
};
