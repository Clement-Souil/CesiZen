import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    ActivityIndicator, Alert,
} from 'react-native';
import { AuthUser } from '../services/authService';
import api from '../services/api';

interface StressResult {
    id: number;
    score: number;
    level: string;
    createdAt: string;
}

interface Props {
    user: AuthUser;
    onLogout: () => void;
}

const levelColor = (level: string) => {
    if (level === 'Faible') return '#16a34a';
    if (level === 'Modéré') return '#d97706';
    return '#dc2626';
};

export default function ProfileScreen({ user, onLogout }: Props) {
    const [history, setHistory] = useState<StressResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/StressResults/history')
            .then(res => setHistory(res.data))
            .catch(() => setHistory([]))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnecter', style: 'destructive', onPress: onLogout },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Mon profil</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
                <Text style={styles.label}>Rôle</Text>
                <Text style={[styles.value, { color: user.role === 'ADMIN' ? '#7c3aed' : '#0d9488' }]}>
                    {user.role}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Historique des tests de stress</Text>

            {loading ? (
                <ActivityIndicator color="#0d9488" style={{ marginTop: 20 }} />
            ) : history.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>Aucun test effectué pour l'instant.</Text>
                    <Text style={styles.emptyHint}>Faites votre premier test de stress !</Text>
                </View>
            ) : (
                history.map(result => (
                    <View key={result.id} style={styles.resultCard}>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultScore}>{result.score} pts</Text>
                            <Text style={[styles.resultLevel, { color: levelColor(result.level) }]}>
                                {result.level}
                            </Text>
                        </View>
                        <Text style={styles.resultDate}>
                            {new Date(result.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </Text>
                    </View>
                ))
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0d9488', marginBottom: 16 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#ccfbf1', marginBottom: 24, gap: 4,
    },
    label: { fontSize: 12, color: '#6b7280', marginTop: 8 },
    value: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
    emptyBox: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24,
        alignItems: 'center', borderWidth: 1, borderColor: '#ccfbf1',
    },
    emptyText: { fontSize: 15, color: '#6b7280', marginBottom: 4 },
    emptyHint: { fontSize: 13, color: '#0d9488' },
    resultCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#ccfbf1', marginBottom: 10,
    },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resultScore: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    resultLevel: { fontSize: 15, fontWeight: '700' },
    resultDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    logoutButton: {
        backgroundColor: '#fee2e2', borderRadius: 16, padding: 16,
        alignItems: 'center', marginTop: 24,
    },
    logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
});
