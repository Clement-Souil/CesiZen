import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';

type HomeNav = BottomTabNavigationProp<TabParamList, 'Accueil'>;

const features: { icon: string; title: string; desc: string; tab: keyof TabParamList }[] = [
    { icon: '📚', title: 'Ressources', desc: "Accédez à notre bibliothèque d'articles sur la santé mentale.", tab: 'Documents' },
    { icon: '🧘', title: 'Test de stress', desc: "Évaluez votre niveau de stress avec l'échelle Holmes & Rahe.", tab: 'Test de stress' },
    { icon: '👤', title: 'Mon profil', desc: "Consultez votre historique et gérez votre compte.", tab: 'Profil' },
];

export default function HomeScreen() {
    const navigation = useNavigation<HomeNav>();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
                <Text style={styles.logo}>🧘</Text>
                <Text style={styles.title}>CESIZen</Text>
                <Text style={styles.subtitle}>L'application de votre santé mentale</Text>
            </View>

            <Text style={styles.sectionTitle}>Que souhaitez-vous faire ?</Text>

            {features.map(f => (
                <TouchableOpacity key={f.title} style={styles.card} onPress={() => navigation.navigate(f.tab)}>
                    <Text style={styles.cardIcon}>{f.icon}</Text>
                    <View style={styles.cardText}>
                        <Text style={styles.cardTitle}>{f.title}</Text>
                        <Text style={styles.cardDesc}>{f.desc}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    💡 Utilisez la barre de navigation en bas pour accéder à toutes les fonctionnalités.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    content: { padding: 24, paddingBottom: 40 },
    hero: { alignItems: 'center', paddingVertical: 32 },
    logo: { fontSize: 56, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#0d9488' },
    subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#ccfbf1', gap: 14,
    },
    cardIcon: { fontSize: 28 },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
    cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 2, lineHeight: 18 },
    infoBox: { backgroundColor: '#ccfbf1', borderRadius: 16, padding: 16, marginTop: 8 },
    infoText: { fontSize: 13, color: '#0f766e', lineHeight: 20 },
});
