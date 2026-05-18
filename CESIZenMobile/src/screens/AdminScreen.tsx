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

interface StressEvent {
    id: number;
    event: string;
    value: number;
}

const CATEGORIES = ['Stress', 'Anxiété', 'Dépression', 'Bien-être', 'Relations', 'Autre'];

export default function AdminScreen() {
    const [tab, setTab] = useState<'users' | 'resources' | 'stress'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [stressEvents, setStressEvents] = useState<StressEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Formulaire ressource
    const [showForm, setShowForm] = useState(false);
    const [editRes, setEditRes] = useState<Resource | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formCat, setFormCat] = useState('Stress');

    // Formulaire stress event
    const [showStressForm, setShowStressForm] = useState(false);
    const [editStress, setEditStress] = useState<StressEvent | null>(null);
    const [stressEvtName, setStressEvtName] = useState('');
    const [stressEvtValue, setStressEvtValue] = useState('');
    const [stressSaving, setStressSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/users/all'),
            api.get('/Resources/admin'),
            api.get('/StressEvents'),
        ]).then(([u, r, s]) => {
            setUsers(u.data);
            setResources(r.data);
            setStressEvents(s.data);
        }).catch(() => Alert.alert('Erreur', 'Impossible de charger les données.')).finally(() => setLoading(false));
    }, []);

    // --- Actions stress events ---
    const openCreateStress = () => {
        setEditStress(null);
        setStressEvtName('');
        setStressEvtValue('');
        setShowStressForm(true);
    };

    const openEditStress = (ev: StressEvent) => {
        setEditStress(ev);
        setStressEvtName(ev.event);
        setStressEvtValue(String(ev.value));
        setShowStressForm(true);
    };

    const saveStressEvent = async () => {
        const val = parseInt(stressEvtValue, 10);
        if (!stressEvtName.trim() || isNaN(val) || val <= 0) {
            Alert.alert('Erreur', 'Nom obligatoire et valeur doit être un nombre positif.');
            return;
        }
        setStressSaving(true);
        try {
            if (editStress) {
                const updated = { ...editStress, event: stressEvtName.trim(), value: val };
                await api.put(`/StressEvents/${editStress.id}`, updated);
                setStressEvents(prev => prev.map(e => e.id === editStress.id ? updated : e));
            } else {
                const res = await api.post('/StressEvents', { event: stressEvtName.trim(), value: val });
                setStressEvents(prev => [...prev, res.data]);
            }
            setShowStressForm(false);
        } catch {
            Alert.alert('Erreur', 'Enregistrement impossible.');
        } finally {
            setStressSaving(false);
        }
    };

    const deleteStressEvent = (id: number) => {
        Alert.alert('Supprimer', 'Supprimer cet événement du questionnaire ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/StressEvents/${id}`);
                        setStressEvents(prev => prev.filter(e => e.id !== id));
                    } catch {
                        Alert.alert('Erreur', 'Suppression impossible.');
                    }
                }
            }
        ]);
    };

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
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
                    <TouchableOpacity style={[styles.tab, tab === 'stress' && styles.tabActive]} onPress={() => setTab('stress')}>
                        <Text style={[styles.tabText, tab === 'stress' && styles.tabTextActive]}>
                            Questionnaire ({stressEvents.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* === UTILISATEURS === */}
            {tab === 'users' && (
                <FlatList
                    style={styles.flatList}
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
                    <FlatList
                        style={styles.flatList}
                        data={resources}
                        keyExtractor={r => String(r.id)}
                        contentContainerStyle={styles.list}
                        ListHeaderComponent={
                            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                                <Text style={styles.addBtnText}>+ Nouvelle ressource</Text>
                            </TouchableOpacity>
                        }
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

            {/* === QUESTIONNAIRE DE STRESS === */}
            {tab === 'stress' && (
                <>
                    <FlatList
                        style={styles.flatList}
                        data={[...stressEvents].sort((a, b) => b.value - a.value)}
                        keyExtractor={e => String(e.id)}
                        contentContainerStyle={styles.list}
                        ListHeaderComponent={
                            <TouchableOpacity style={styles.addBtn} onPress={openCreateStress}>
                                <Text style={styles.addBtnText}>+ Nouvel événement</Text>
                            </TouchableOpacity>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[styles.cardName, { flex: 1, marginRight: 8 }]}>{item.event}</Text>
                                    <View style={styles.valueBadge}>
                                        <Text style={styles.valueBadgeText}>{item.value} pts</Text>
                                    </View>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => openEditStress(item)}>
                                        <Text style={styles.btnText}>Modifier</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => deleteStressEvent(item.id)}>
                                        <Text style={styles.btnText}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </>
            )}

            {/* Modal formulaire stress event */}
            <Modal visible={showStressForm} animationType="slide" transparent onRequestClose={() => setShowStressForm(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.formTitle}>{editStress ? 'Modifier l\'événement' : 'Nouvel événement'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom de l'événement *"
                            value={stressEvtName}
                            onChangeText={setStressEvtName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Valeur en points *"
                            value={stressEvtValue}
                            onChangeText={setStressEvtValue}
                            keyboardType="numeric"
                        />
                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                                onPress={saveStressEvent}
                                disabled={stressSaving}
                            >
                                {stressSaving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.btnText}>{editStress ? 'Enregistrer' : 'Créer'}</Text>
                                }
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setShowStressForm(false)}>
                                <Text style={styles.btnText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    tabsScroll: { flexGrow: 0, marginHorizontal: 20, marginBottom: 16 },
    tabs: { flexDirection: 'row', backgroundColor: '#e0f2f1', borderRadius: 12, padding: 4, gap: 4 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#0d9488' },
    tabText: { color: '#0d9488', fontWeight: '600', fontSize: 13 },
    tabTextActive: { color: '#fff' },
    flatList: { flex: 1 },
    list: { padding: 20, paddingTop: 8, gap: 12 },
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
    addBtn: { backgroundColor: '#0d9488', marginBottom: 12, borderRadius: 12, padding: 12, alignItems: 'center' },
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
    valueBadge: { backgroundColor: '#ccfbf1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    valueBadgeText: { color: '#0d9488', fontWeight: '700', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
    modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 0 },
});
