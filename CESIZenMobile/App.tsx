import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';

import { authService, AuthUser } from './src/services/authService';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import DocumentsScreen from './src/screens/DocumentsScreen';
import StressTestScreen from './src/screens/StressTestScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';

import { TabParamList } from './src/types/navigation';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

export type { TabParamList };

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        'Accueil': '🏠',
        'Documents': '📚',
        'Test de stress': '🧘',
        'Profil': '👤',
        'Admin': '⚙️',
    };
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '•'}</Text>;
}

function MainTabs({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
    const isAdmin = user.role === 'ADMIN';
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
                tabBarActiveTintColor: '#0d9488',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: { paddingBottom: 4, height: 60 },
                tabBarLabelStyle: { fontSize: 11 },
            })}
        >
            <Tab.Screen name="Accueil" component={HomeScreen} />
            <Tab.Screen name="Documents" component={DocumentsScreen} />
            <Tab.Screen name="Test de stress">
                {() => <StressTestScreen user={user} />}
            </Tab.Screen>
            <Tab.Screen name="Profil">
                {() => <ProfileScreen user={user} onLogout={onLogout} />}
            </Tab.Screen>
            {isAdmin && (
                <Tab.Screen name="Admin" component={AdminScreen} />
            )}
        </Tab.Navigator>
    );
}

export default function App() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getCurrentUser().then(u => {
            setUser(u);
            setLoading(false);
        });
    }, []);

    const handleLogin = (loggedUser: AuthUser) => setUser(loggedUser);
    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Main">
                        {() => <MainTabs user={user} onLogout={handleLogout} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Auth">
                        {() => <AuthScreen onLogin={handleLogin} />}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
