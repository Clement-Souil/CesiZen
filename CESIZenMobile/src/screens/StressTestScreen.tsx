import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { AuthUser } from '../services/authService';
import api from '../services/api';

interface StressEvent {
    id: number;
    event: string;
    value: number;
}

const getInterpretation = (score: number) => {
    if (score < 150) return { level: 'Faible', color: '#16a34a', bg: '#f0fdf4', message: 'Votre niveau de stress est relativement faible (~30% de risque de maladie liée au stress).' };
    if (score < 300) return { level: 'Modéré', color: '#d97706', bg: '#fffbeb', message: 'Votre niveau de stress est modéré (~50% de risque). Pensez à pratiquer des techniques de relaxation.' };
    return { level: 'Élevé', color: '#dc2626', bg: '#fef2f2', message: 'Votre niveau de stress est élevé (~80% de risque). Consultez un professionnel de santé mentale.' };
};

interface Props {
    user: AuthUser;
}

export default function StressTestScreen({ user }: Props) {
    const [stressEvents, setStressEvents] = useState<StressEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [selected, setSelected] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/StressEvents')
            .then(res => setStressEvents(res.data))
            .catch(() => {})
            .finally(() => setLoadingEvents(false));
    }, []);

    const toggle = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const score = selected.reduce((sum, id) => {
        const ev = stressEvents.find(e => e.id === id);
        return sum + (ev?.value ?? 0);
    }, 0);

    const interpretation = getInterpretation(score);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await api.post('/StressResults', { Score: score, Level: interpretation.level });
        } catch {
            // non-bloquant si pas connecté
        } finally {
            setSaving(false);
            setShowResult(true);
        }
    };

    const handleReset = () => {
        setSelected([]);
        setShowResult(false);
    };

    if (loadingEvents) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 60 }} />
            </View>
        );
    }

    if (showResult) {
        return (
            <SafeAreaView style={[styles.resultContainer, { backgroundColor: interpretation.bg }]}>
                <View style={styles.resultContent}>
                    <Text style={styles.resultTitle}>Résultat</Text>
                    <Text style={[styles.resultScore, { color: interpretation.color }]}>
                        {score} points
                    </Text>
                    <Text style={[styles.resultLevel, { color: interpretation.color }]}>
                        Niveau {interpretation.level}
                    </Text>
                    <Text style={styles.resultMessage}>{interpretation.message}</Text>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetText}>Refaire le test</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Test de stress</Text>
                <Text style={styles.subtitle}>Échelle de Holmes et Rahe</Text>
                <Text style={styles.instructions}>
                    Cochez les événements vécus au cours des 12 derniers mois.
                </Text>

                <View style={styles.counter}>
                    <Text style={styles.counterText}>
                        {selected.length} sélectionné{selected.length > 1 ? 's' : ''} • {score} pts
                    </Text>
                </View>

                {stressEvents.map(ev => {
                    const isSelected = selected.includes(ev.id);
                    return (
                        <TouchableOpacity
                            key={ev.id}
                            style={[styles.item, isSelected && styles.itemSelected]}
                            onPress={() => toggle(ev.id)}
                        >
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <View style={styles.itemText}>
                                <Text style={styles.itemLabel}>{ev.event}</Text>
                                <Text style={styles.itemValue}>{ev.value} pts</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    style={[styles.submitButton, selected.length === 0 && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={selected.length === 0 || saving}
                >
                    {saving
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.submitText}>Voir mes résultats</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0d9488', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
    instructions: { fontSize: 14, color: '#374151', marginBottom: 16, lineHeight: 20 },
    counter: {
        backgroundColor: '#ccfbf1', borderRadius: 12, padding: 12, marginBottom: 16,
    },
    counterText: { color: '#0d9488', fontWeight: '600', textAlign: 'center' },
    item: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: '#ccfbf1',
    },
    itemSelected: { borderColor: '#0d9488', backgroundColor: '#f0fdfa' },
    checkbox: {
        width: 22, height: 22, borderRadius: 6, borderWidth: 2,
        borderColor: '#9ca3af', alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    checkboxSelected: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    itemText: { flex: 1 },
    itemLabel: { fontSize: 14, color: '#1f2937' },
    itemValue: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    submitButton: {
        backgroundColor: '#0d9488', borderRadius: 16, padding: 16,
        alignItems: 'center', marginTop: 16,
    },
    submitDisabled: { opacity: 0.4 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    // Résultats
    resultContainer: { flex: 1, justifyContent: 'center' },
    resultContent: { padding: 32, alignItems: 'center' },
    resultTitle: { fontSize: 18, color: '#374151', marginBottom: 16 },
    resultScore: { fontSize: 56, fontWeight: 'bold', marginBottom: 8 },
    resultLevel: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
    resultMessage: { fontSize: 15, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    resetButton: {
        backgroundColor: '#0d9488', borderRadius: 16, paddingHorizontal: 32, paddingVertical: 14,
    },
    resetText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
