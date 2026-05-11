import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { authService, AuthUser } from '../services/authService';

interface Props {
    onLogin: (user: AuthUser) => void;
}

export default function AuthScreen({ onLogin }: Props) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        setLoading(true);
        try {
            const user = await authService.login(email.trim(), password);
            onLogin(user);
        } catch (err: any) {
            const msg = err.response?.data || 'Email ou mot de passe incorrect.';
            Alert.alert('Connexion échouée', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email.trim() || !password.trim() || !displayName.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        setLoading(true);
        try {
            await authService.register(email.trim(), password, displayName.trim());
            Alert.alert('Compte créé !', 'Vous pouvez maintenant vous connecter.');
            setMode('login');
        } catch (err: any) {
            const msg = err.response?.data || 'Impossible de créer le compte.';
            Alert.alert('Erreur', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.logo}>🧘 CESIZen</Text>
                <Text style={styles.subtitle}>L'application de votre santé mentale</Text>

                {/* Onglets */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'login' && styles.tabActive]}
                        onPress={() => setMode('login')}
                    >
                        <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Connexion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'register' && styles.tabActive]}
                        onPress={() => setMode('register')}
                    >
                        <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    {mode === 'register' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'affichage"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={mode === 'login' ? handleLogin : handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>
                                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logo: { fontSize: 32, fontWeight: 'bold', color: '#0d9488', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
    tabs: { flexDirection: 'row', backgroundColor: '#e0f2f1', borderRadius: 12, padding: 4, marginBottom: 24 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#0d9488' },
    tabText: { color: '#0d9488', fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    form: { gap: 12 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccfbf1',
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    },
    button: {
        backgroundColor: '#0d9488', borderRadius: 12, paddingVertical: 14,
        alignItems: 'center', marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
