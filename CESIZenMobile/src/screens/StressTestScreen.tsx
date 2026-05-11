import React, { useState } from 'react';
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

const stressEvents: StressEvent[] = [
    { id: 1, event: "Décès d'un conjoint", value: 100 },
    { id: 2, event: "Divorce", value: 73 },
    { id: 3, event: "Séparation conjugale", value: 65 },
    { id: 4, event: "Emprisonnement", value: 63 },
    { id: 5, event: "Décès d'un membre proche de la famille", value: 63 },
    { id: 6, event: "Maladie ou blessure personnelle", value: 53 },
    { id: 7, event: "Mariage", value: 50 },
    { id: 8, event: "Licenciement", value: 47 },
    { id: 9, event: "Réconciliation conjugale", value: 45 },
    { id: 10, event: "Retraite", value: 45 },
    { id: 11, event: "Changement dans la santé d'un membre de la famille", value: 44 },
    { id: 12, event: "Grossesse", value: 40 },
    { id: 13, event: "Difficultés sexuelles", value: 39 },
    { id: 14, event: "Arrivée d'un nouveau membre dans la famille", value: 39 },
    { id: 15, event: "Changement important au travail", value: 39 },
    { id: 16, event: "Changement de situation financière", value: 38 },
    { id: 17, event: "Décès d'un ami proche", value: 37 },
    { id: 18, event: "Changement de type de travail", value: 36 },
    { id: 19, event: "Changement dans le nombre de disputes conjugales", value: 35 },
    { id: 20, event: "Emprunt important", value: 31 },
    { id: 21, event: "Saisie d'un prêt ou d'une hypothèque", value: 30 },
    { id: 22, event: "Changement de responsabilités au travail", value: 29 },
    { id: 23, event: "Départ d'un enfant de la maison", value: 29 },
    { id: 24, event: "Problèmes avec la belle-famille", value: 29 },
    { id: 25, event: "Réussite personnelle remarquable", value: 28 },
    { id: 26, event: "Début ou arrêt de travail du conjoint", value: 26 },
    { id: 27, event: "Début ou fin des études", value: 26 },
    { id: 28, event: "Changement dans les conditions de vie", value: 25 },
    { id: 29, event: "Révision des habitudes personnelles", value: 24 },
    { id: 30, event: "Problèmes avec le patron", value: 23 },
    { id: 31, event: "Changement d'horaires ou de conditions de travail", value: 20 },
    { id: 32, event: "Changement de résidence", value: 20 },
    { id: 33, event: "Changement d'école", value: 20 },
    { id: 34, event: "Changement de loisirs", value: 19 },
    { id: 35, event: "Changement d'activités religieuses", value: 19 },
    { id: 36, event: "Changement d'activités sociales", value: 18 },
    { id: 37, event: "Emprunt modéré", value: 17 },
    { id: 38, event: "Changement dans les habitudes de sommeil", value: 16 },
    { id: 39, event: "Changement du nombre de réunions familiales", value: 15 },
    { id: 40, event: "Changement dans les habitudes alimentaires", value: 15 },
    { id: 41, event: "Vacances", value: 13 },
    { id: 42, event: "Fêtes de fin d'année", value: 12 },
    { id: 43, event: "Infractions mineures à la loi", value: 11 },
];

const getInterpretation = (score: number) => {
    if (score < 150) return { level: 'Faible', color: '#16a34a', bg: '#f0fdf4', message: 'Votre niveau de stress est relativement faible (~30% de risque de maladie liée au stress).' };
    if (score < 300) return { level: 'Modéré', color: '#d97706', bg: '#fffbeb', message: 'Votre niveau de stress est modéré (~50% de risque). Pensez à pratiquer des techniques de relaxation.' };
    return { level: 'Élevé', color: '#dc2626', bg: '#fef2f2', message: 'Votre niveau de stress est élevé (~80% de risque). Consultez un professionnel de santé mentale.' };
};

interface Props {
    user: AuthUser;
}

export default function StressTestScreen({ user }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [saving, setSaving] = useState(false);

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
