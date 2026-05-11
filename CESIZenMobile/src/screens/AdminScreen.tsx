import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    FlatList, Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    displayName: string;
    role: string;
    isActive: boolean;
}

interface Resource {
    id: number;
    title: string;
    description: string;
    content: string;
    category: string;
    authorEmail: string;
    isApproved: boolean;
}

const CATEGORIES = ['Stress', 'Anxiété', 'Dépression', 'Bien-être', 'Relations', 'Autre'];

export default function AdminScreen() {
    const [tab, setTab] = useState<'users' | 'resources'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Formulaire ressource
    const [showForm, setShowForm] = useState(false);
    const [editRes, setEditRes] = useState<Resource | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formCat, setFormCat] = useState('Stress');

    useEffect(() => {
        Promise.all([
            api.get('/users/all'),
            api.get('/Resources/admin'),
        ]).then(([u, r]) => {
            setUsers(u.data);
            setResources(r.data);
        }).catch(() => Alert.alert('Erreur', 'Impossible de charger les données.')).finally(() => setLoading(false));
    }, []);

    // --- Actions utilisateurs ---
    const toggleActive = async (user: User) => {
        try {
            const res = await api.put(`/users/${user.id}/toggle-active`);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: res.data.isActive } : u));
        } catch {
            Alert.alert('Erreur', 'Modification impossible.');
        }
    };

    const changeRole = async (user: User, newRole: string) => {
        try {
            await api.put(`/users/${user.id}/role`, JSON.stringify(newRole), {
                headers: { 'Content-Type': 'application/json' },
            });
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch {
            Alert.alert('Erreur', 'Modification impossible.');
        }
    };

    const deleteUser = (user: User) => {
        Alert.alert('Supprimer', `Supprimer ${user.displayName || user.email} ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/users/${user.id}`);
                        setUsers(prev => prev.filter(u => u.id !== user.id));
                    } catch {
                        Alert.alert('Erreur', 'Suppression impossible.');
                    }
                }
            }
        ]);
    };

    // --- Actions ressources ---
    const openCreate = () => {
        setEditRes(null);
        setFormTitle(''); setFormDesc(''); setFormContent(''); setFormCat('Stress');
        setShowForm(true);
    };

    const openEdit = (res: Resource) => {
        setEditRes(res);
        setFormTitle(res.title); setFormDesc(res.description);
        setFormContent(res.content); setFormCat(res.category || 'Stress');
        setShowForm(true);
    };

    const saveResource = async () => {
        if (!formTitle.trim() || !formContent.trim()) {
            Alert.alert('Erreur', 'Titre et contenu sont obligatoires.');
            return;
        }
        try {
            if (editRes) {
                const updated = { ...editRes, title: formTitle, description: formDesc, content: formContent, category: formCat };
                await api.put(`/Resources/${editRes.id}`, updated);
                setResources(prev => prev.map(r => r.id === editRes.id ? updated : r));
            } else {
                const res = await api.post('/Resources', { title: formTitle, description: formDesc, content: formContent, category: formCat, isApproved: true });
                setResources(prev => [res.data, ...prev]);
            }
            setShowForm(false);
        } catch {
            Alert.alert('Erreur', 'Enregistrement impossible.');
        }
    };

    const approveResource = async (res: Resource) => {
        try {
            const updated = { ...res, isApproved: true };
            await api.put(`/Resources/${res.id}`, updated);
            setResources(prev => prev.map(r => r.id === res.id ? updated : r));
        } catch {
            Alert.alert('Erreur', 'Approbation impossible.');
        }
    };

    const deleteResource = (id: number) => {
        Alert.alert('Supprimer', 'Supprimer cette ressource ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/Resources/${id}`);
                        setResources(prev => prev.filter(r => r.id !== id));
                    } catch {
                        Alert.alert('Erreur', 'Suppression impossible.');
                    }
                }
            }
        ]);
    };

    if (loading) return (
        <View style={styles.centered}><ActivityIndicator size="large" color="#0d9488" /></View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Administration</Text>

            {/* Onglets */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, tab === 'users' && styles.tabActive]} onPress={() => setTab('users')}>
                    <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>
                        Utilisateurs ({users.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'resources' && styles.tabActive]} onPress={() => setTab('resources')}>
                    <Text style={[styles.tabText, tab === 'resources' && styles.tabTextActive]}>
                        Ressources ({resources.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* === UTILISATEURS === */}
            {tab === 'users' && (
                <FlatList
                    data={users}
                    keyExtractor={u => u.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={[styles.card, !item.isActive && { opacity: 0.6 }]}>
                            <Text style={styles.cardName}>{item.displayName || '—'}</Text>
                            <Text style={styles.cardEmail}>{item.email}</Text>
                            <View style={styles.row}>
                                <View style={[styles.roleBadge, item.role === 'ADMIN' && styles.roleBadgeAdmin]}>
                                    <Text style={styles.roleBadgeText}>{item.role}</Text>
                                </View>
                                <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
                                    <Text style={styles.statusText}>{item.isActive ? 'Actif' : 'Désactivé'}</Text>
                                </View>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.btn, item.role === 'ADMIN' ? styles.btnSecondary : styles.btnPrimary]}
                                    onPress={() => changeRole(item, item.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                >
                                    <Text style={styles.btnText}>{item.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnWarning]}
                                    onPress={() => toggleActive(item)}
                                >
                                    <Text style={styles.btnText}>{item.isActive ? 'Désactiver' : 'Réactiver'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => deleteUser(item)}>
                                    <Text style={styles.btnText}>Supprimer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* === RESSOURCES === */}
            {tab === 'resources' && (
                <>
                    <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                        <Text style={styles.addBtnText}>+ Nouvelle ressource</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={resources}
                        keyExtractor={r => String(r.id)}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.cardName}>{item.title}</Text>
                                <Text style={styles.cardEmail}>{item.category || 'Autre'} • {item.authorEmail || 'Anonyme'}</Text>
                                <View style={[styles.statusBadge, item.isApproved ? styles.statusActive : styles.statusInactive, { alignSelf: 'flex-start' }]}>
                                    <Text style={styles.statusText}>{item.isApproved ? 'Publié' : 'En attente'}</Text>
                                </View>
                                <View style={styles.actions}>
                                    {!item.isApproved && (
                                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => approveResource(item)}>
                                            <Text style={styles.btnText}>Approuver</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => openEdit(item)}>
                                        <Text style={styles.btnText}>Modifier</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => deleteResource(item.id)}>
                                        <Text style={styles.btnText}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </>
            )}

            {/* Modal formulaire ressource */}
            <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)}>
                <ScrollView contentContainerStyle={styles.formModal}>
                    <Text style={styles.formTitle}>{editRes ? 'Modifier la ressource' : 'Nouvelle ressource'}</Text>
                    <TextInput style={styles.input} placeholder="Titre *" value={formTitle} onChangeText={setFormTitle} />
                    <TextInput style={styles.input} placeholder="Description" value={formDesc} onChangeText={setFormDesc} />
                    <TextInput style={[styles.input, { height: 120 }]} placeholder="Contenu *" value={formContent} onChangeText={setFormContent} multiline />
                    <Text style={styles.label}>Catégorie</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.catChip, formCat === cat && styles.catChipActive]}
                                onPress={() => setFormCat(cat)}
                            >
                                <Text style={[styles.catText, formCat === cat && styles.catTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.formActions}>
                        <TouchableOpacity style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={saveResource}>
                            <Text style={styles.btnText}>{editRes ? 'Enregistrer' : 'Créer'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setShowForm(false)}>
                            <Text style={styles.btnText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0d9488', padding: 20, paddingBottom: 12 },
    tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#e0f2f1', borderRadius: 12, padding: 4, marginBottom: 16 },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#0d9488' },
    tabText: { color: '#0d9488', fontWeight: '600', fontSize: 13 },
    tabTextActive: { color: '#fff' },
    list: { padding: 20, paddingTop: 0, gap: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#ccfbf1', gap: 6 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
    cardEmail: { fontSize: 13, color: '#6b7280' },
    row: { flexDirection: 'row', gap: 8 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: '#ccfbf1' },
    roleBadgeAdmin: { backgroundColor: '#ede9fe' },
    roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#374151' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusActive: { backgroundColor: '#dcfce7' },
    statusInactive: { backgroundColor: '#fee2e2' },
    statusText: { fontSize: 11, fontWeight: '600', color: '#374151' },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
    btn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    btnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    btnPrimary: { backgroundColor: '#0d9488' },
    btnSecondary: { backgroundColor: '#6b7280' },
    btnWarning: { backgroundColor: '#d97706' },
    btnDanger: { backgroundColor: '#dc2626' },
    addBtn: { backgroundColor: '#0d9488', marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 12, alignItems: 'center' },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    // Formulaire modal
    formModal: { padding: 24, paddingTop: 48 },
    formTitle: { fontSize: 20, fontWeight: 'bold', color: '#0d9488', marginBottom: 20 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccfbf1',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12,
    },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccfbf1' },
    catChipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    catText: { fontSize: 13, color: '#0d9488', fontWeight: '600' },
    catTextActive: { color: '#fff' },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
