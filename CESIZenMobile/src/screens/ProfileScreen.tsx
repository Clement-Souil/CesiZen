import React, { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

    // Changement de mot de passe
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [pwdLoading, setPwdLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPwd || !newPwd) { setPwdMsg({ ok: false, text: 'Remplissez les deux champs.' }); return; }
        if (newPwd.length < 6) { setPwdMsg({ ok: false, text: 'Minimum 6 caractères.' }); return; }
        setPwdLoading(true);
        try {
            await api.put('/Users/change-password', { currentPassword: currentPwd, newPassword: newPwd });
            setPwdMsg({ ok: true, text: 'Mot de passe modifié !' });
            setCurrentPwd(''); setNewPwd('');
        } catch {
            setPwdMsg({ ok: false, text: 'Mot de passe actuel incorrect.' });
        } finally {
            setPwdLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            api.get('/StressResults/history')
                .then(res => setHistory(res.data))
                .catch(() => setHistory([]))
                .finally(() => setLoading(false));
        }, [])
    );

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
                <ScrollView
                    style={styles.historyScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    {[...history]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(result => (
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
                    }
                </ScrollView>
            )}

            <TouchableOpacity style={styles.pwdButton} onPress={() => { setShowPwdModal(true); setPwdMsg(null); }}>
                <Text style={styles.pwdButtonText}>🔑  Changer mon mot de passe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

            {/* Modal changement de mot de passe */}
            <Modal visible={showPwdModal} animationType="slide" transparent onRequestClose={() => setShowPwdModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Changer le mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe actuel"
                            secureTextEntry
                            value={currentPwd}
                            onChangeText={setCurrentPwd}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nouveau mot de passe (6 min.)"
                            secureTextEntry
                            value={newPwd}
                            onChangeText={setNewPwd}
                        />
                        {pwdMsg && (
                            <Text style={[styles.pwdMsg, { color: pwdMsg.ok ? '#16a34a' : '#dc2626' }]}>
                                {pwdMsg.text}
                            </Text>
                        )}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleChangePassword}
                            disabled={pwdLoading}
                        >
                            {pwdLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.submitText}>Modifier</Text>
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowPwdModal(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    historyScroll: {
        maxHeight: 270, // ~3 cartes visibles
    },
    resultCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#ccfbf1', marginBottom: 10,
    },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resultScore: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    resultLevel: { fontSize: 15, fontWeight: '700' },
    resultDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    pwdButton: {
        backgroundColor: '#f0fdfa', borderRadius: 16, padding: 16,
        alignItems: 'center', marginTop: 12,
        borderWidth: 1, borderColor: '#ccfbf1',
    },
    pwdButtonText: { color: '#0d9488', fontWeight: '700', fontSize: 15 },
    logoutButton: {
        backgroundColor: '#fee2e2', borderRadius: 16, padding: 16,
        alignItems: 'center', marginTop: 12,
    },
    logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
    modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#0d9488', marginBottom: 16 },
    input: {
        borderWidth: 1, borderColor: '#ccfbf1', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, fontSize: 15,
    },
    pwdMsg: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
    submitButton: { backgroundColor: '#0d9488', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
    submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    cancelButton: { alignItems: 'center', padding: 10 },
    cancelText: { color: '#6b7280', fontSize: 14 },
});
