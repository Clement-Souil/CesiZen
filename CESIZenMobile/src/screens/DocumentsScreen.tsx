import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    FlatList, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import api from '../services/api';

interface Resource {
    id: number;
    title: string;
    description: string;
    content: string;
    category: string;
}

const CATEGORIES = ['Tous', 'Stress', 'Anxiété', 'Dépression', 'Bien-être', 'Relations', 'Autre'];

const categoryColors: Record<string, string> = {
    Stress: '#fca5a5',
    Anxiété: '#fdba74',
    Dépression: '#93c5fd',
    'Bien-être': '#86efac',
    Relations: '#d8b4fe',
    Autre: '#e5e7eb',
};

export default function DocumentsScreen() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filtered, setFiltered] = useState<Resource[]>([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Resource | null>(null);

    useEffect(() => {
        api.get('/Resources')
            .then(res => {
                setResources(res.data);
                setFiltered(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = resources;
        if (activeCategory !== 'Tous') {
            result = result.filter(r => r.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, activeCategory, resources]);

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0d9488" />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ressources</Text>

            {/* Barre de recherche */}
            <TextInput
                style={styles.search}
                placeholder="🔍  Rechercher..."
                value={search}
                onChangeText={setSearch}
            />

            {/* Filtres catégories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Liste */}
            <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.empty}>Aucune ressource trouvée.</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={[styles.badge, { backgroundColor: categoryColors[item.category] ?? '#e5e7eb' }]}>
                                <Text style={styles.badgeText}>{item.category || 'Autre'}</Text>
                            </View>
                        </View>
                        {item.description ? (
                            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        ) : null}
                        <Text style={styles.readMore}>Lire la suite →</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Modal détail */}
            <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                        <Text style={styles.closeBtnText}>✕ Fermer</Text>
                    </TouchableOpacity>
                    {selected && (
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <View style={[styles.badge, { backgroundColor: categoryColors[selected.category] ?? '#e5e7eb', alignSelf: 'flex-start', marginBottom: 12 }]}>
                                <Text style={styles.badgeText}>{selected.category || 'Autre'}</Text>
                            </View>
                            <Text style={styles.modalTitle}>{selected.title}</Text>
                            {selected.description ? (
                                <Text style={styles.modalDesc}>{selected.description}</Text>
                            ) : null}
                            <Text style={styles.modalBody}>{selected.content}</Text>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0d9488', padding: 20, paddingBottom: 12 },
    search: {
        marginHorizontal: 20, marginBottom: 12, backgroundColor: '#fff',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1, borderColor: '#ccfbf1', fontSize: 15,
    },
    categoryBar: { paddingLeft: 20, marginBottom: 12, flexGrow: 0 },
    catChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccfbf1',
    },
    catChipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    catText: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
    catTextActive: { color: '#fff' },
    list: { padding: 20, paddingTop: 0, gap: 12 },
    empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#ccfbf1',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
    cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1f2937' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
    cardDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
    readMore: { fontSize: 13, color: '#0d9488', fontWeight: '600', marginTop: 8 },
    // Modal
    modal: { flex: 1, backgroundColor: '#fff' },
    closeBtn: { padding: 20, paddingBottom: 12 },
    closeBtnText: { color: '#0d9488', fontSize: 15, fontWeight: '700' },
    modalContent: { padding: 20, paddingTop: 0, paddingBottom: 40 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    modalDesc: { fontSize: 15, color: '#6b7280', marginBottom: 16, fontStyle: 'italic' },
    modalBody: { fontSize: 15, color: '#374151', lineHeight: 24 },
});
