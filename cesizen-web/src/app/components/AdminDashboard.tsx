import React, { useEffect, useState } from 'react';
import api from "@/api/axios";

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

const emptyResource = { title: '', description: '', content: '', category: 'Stress' };

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'resources'>('users');

    // --- Utilisateurs ---
    const [users, setUsers] = useState<User[]>([]);

    // --- Ressources ---
    const [resources, setResources] = useState<Resource[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [form, setForm] = useState(emptyResource);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, resourcesRes] = await Promise.all([
                    api.get('users/all'),
                    api.get('Resources/admin'),
                ]);
                setUsers(usersRes.data);
                setResources(resourcesRes.data);
            } catch {
                setError("Erreur lors du chargement des données.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Actions utilisateurs ---
    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
        try {
            await api.delete(`users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch {
            alert("Impossible de supprimer l'utilisateur.");
        }
    };

    const handleToggleActive = async (id: string) => {
        try {
            const res = await api.put(`/users/${id}/toggle-active`);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: res.data.isActive } : u));
        } catch {
            alert("Erreur lors de la modification.");
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            await api.put(`/users/${id}/role`, JSON.stringify(newRole), {
                headers: { 'Content-Type': 'application/json' }
            });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch {
            alert("Erreur lors du changement de rôle.");
        }
    };

    // --- Actions ressources ---
    const openCreateForm = () => {
        setEditingResource(null);
        setForm(emptyResource);
        setShowForm(true);
    };

    const openEditForm = (res: Resource) => {
        setEditingResource(res);
        setForm({ title: res.title, description: res.description, content: res.content, category: res.category });
        setShowForm(true);
    };

    const handleSubmitResource = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            alert("Le titre et le contenu sont obligatoires.");
            return;
        }
        try {
            if (editingResource) {
                const updated = { ...editingResource, ...form };
                await api.put(`Resources/${editingResource.id}`, updated);
                setResources(prev => prev.map(r => r.id === editingResource.id ? updated : r));
            } else {
                const res = await api.post('Resources', { ...form, isApproved: true });
                setResources(prev => [res.data, ...prev]);
            }
            setShowForm(false);
        } catch {
            alert("Erreur lors de l'enregistrement.");
        }
    };

    const handleApprove = async (resource: Resource) => {
        try {
            const updated = { ...resource, isApproved: true };
            await api.put(`Resources/${resource.id}`, updated);
            setResources(prev => prev.map(r => r.id === resource.id ? updated : r));
        } catch {
            alert("Erreur lors de l'approbation.");
        }
    };

    const handleDeleteResource = async (id: number) => {
        if (!window.confirm("Supprimer définitivement cette ressource ?")) return;
        try {
            await api.delete(`Resources/${id}`);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-teal-600 text-lg">Chargement...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-teal-800 mb-6">Tableau de bord administrateur</h1>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}

            {/* Onglets */}
            <div className="flex gap-2 mb-6 border-b border-teal-100">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'users' ? 'bg-teal-600 text-white' : 'text-teal-600 hover:bg-teal-50'}`}
                >
                    Utilisateurs ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === 'resources' ? 'bg-teal-600 text-white' : 'text-teal-600 hover:bg-teal-50'}`}
                >
                    Ressources ({resources.length})
                </button>
            </div>

            {/* === ONGLET UTILISATEURS === */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-teal-50 text-teal-800">
                            <tr>
                                <th className="px-4 py-3 text-left">Nom</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Rôle</th>
                                <th className="px-4 py-3 text-left">Statut</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-teal-50">
                            {users.map(user => {
                                const isAdmin = user.role === 'ADMIN';
                                return (
                                <tr key={user.id} className={`${!user.isActive ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3 font-medium">{user.displayName || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            disabled={isAdmin}
                                            className={`border border-teal-200 rounded-lg px-2 py-1 text-sm ${isAdmin ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Actif' : 'Désactivé'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2">
                                        {isAdmin ? (
                                            <span className="px-3 py-1 rounded-lg text-xs text-gray-400 bg-gray-100 italic">Administrateur</span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleToggleActive(user.id)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium ${user.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                >
                                                    {user.isActive ? 'Désactiver' : 'Réactiver'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* === ONGLET RESSOURCES === */}
            {activeTab === 'resources' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={openCreateForm}
                            className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 font-medium"
                        >
                            + Nouvelle ressource
                        </button>
                    </div>

                    {/* Formulaire création/édition */}
                    {showForm && (
                        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
                            <h2 className="text-lg font-semibold text-teal-800 mb-4">
                                {editingResource ? 'Modifier la ressource' : 'Nouvelle ressource'}
                            </h2>
                            <div className="grid gap-3">
                                <input
                                    type="text"
                                    placeholder="Titre *"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className="border border-teal-200 rounded-xl px-4 py-2 w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Description courte"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="border border-teal-200 rounded-xl px-4 py-2 w-full"
                                />
                                <textarea
                                    placeholder="Contenu complet *"
                                    value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    rows={5}
                                    className="border border-teal-200 rounded-xl px-4 py-2 w-full resize-none"
                                />
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="border border-teal-200 rounded-xl px-4 py-2"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmitResource}
                                        className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700"
                                    >
                                        {editingResource ? 'Enregistrer' : 'Créer'}
                                    </button>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-teal-50 text-teal-800">
                                <tr>
                                    <th className="px-4 py-3 text-left">Titre</th>
                                    <th className="px-4 py-3 text-left">Catégorie</th>
                                    <th className="px-4 py-3 text-left">Auteur</th>
                                    <th className="px-4 py-3 text-left">Statut</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-teal-50">
                                {resources.map(res => (
                                    <tr key={res.id}>
                                        <td className="px-4 py-3 font-medium">{res.title}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                                                {res.category || 'Autre'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{res.authorEmail || 'Anonyme'}</td>
                                        <td className="px-4 py-3">
                                            {res.isApproved
                                                ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Publié</span>
                                                : <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">En attente</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            {!res.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(res)}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
                                                >
                                                    Approuver
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openEditForm(res)}
                                                className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(res.id)}
                                                className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
