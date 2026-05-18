import { useEffect, useState } from "react";
import { User, LogOut, Calendar, Activity, Loader2, KeyRound } from "lucide-react";
import { Button } from "./ui/button";
import api from "../../api/axios";

interface ProfilePageProps {
    userEmail: string | null;
    onLogout: () => void;
}

export function ProfilePage({ userEmail, onLogout }: ProfilePageProps) {
    // 1. ÉTATS : On crée une mémoire pour l'historique et pour le chargement
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Changement de mot de passe
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [pwdLoading, setPwdLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPwd || !newPwd) { setPwdMsg({ ok: false, text: 'Remplissez les deux champs.' }); return; }
        if (newPwd.length < 6) { setPwdMsg({ ok: false, text: 'Le nouveau mot de passe doit faire au moins 6 caractères.' }); return; }
        setPwdLoading(true);
        try {
            await api.put('/Users/change-password', { currentPassword: currentPwd, newPassword: newPwd });
            setPwdMsg({ ok: true, text: 'Mot de passe modifié avec succès !' });
            setCurrentPwd(''); setNewPwd('');
        } catch {
            setPwdMsg({ ok: false, text: 'Mot de passe actuel incorrect.' });
        } finally {
            setPwdLoading(false);
        }
    };

    // 2. EFFET : On va chercher les données en base SQL dès que le composant s'affiche
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Appel à ta route .NET sécurisée
                const response = await api.get('/StressResults/history');
                setHistory(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'historique :", error);
            } finally {
                // On arrête l'affichage du chargement, peu importe le résultat
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []); // Le tableau vide [] signifie "exécuter une seule fois au chargement"

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-6 pb-24">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-teal-900 mb-8">Mon Profil</h1>

                {/* Section Utilisateur */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Utilisateur connecté</p>
                        <p className="font-bold text-teal-800">{userEmail || "Utilisateur anonyme"}</p>
                    </div>
                </div>

                {/* Section Activité */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-8">
                    <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" /> Suivi du stress
                    </h3>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center py-8 text-teal-600">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">Chargement de vos résultats...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Aucun test réalisé pour le moment.
                            </p>
                        ) : (
                            <div className="overflow-y-auto max-h-64 space-y-3 pr-1">
                                {[...history]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((act) => (
                                        <div key={act.id} className="flex justify-between items-center p-3 bg-teal-50 rounded-xl border border-teal-100/50">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-teal-600" />
                                                <span className="text-sm">
                                                    {new Date(act.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-teal-900">{act.score} pts</p>
                                                <p className="text-xs text-teal-600 font-medium">{act.level}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/* Section changement de mot de passe */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-6">
                    <button
                        onClick={() => { setShowPwdForm(v => !v); setPwdMsg(null); }}
                        className="flex items-center gap-2 text-teal-700 font-semibold w-full"
                    >
                        <KeyRound className="w-5 h-5" />
                        Changer mon mot de passe
                        <span className="ml-auto text-teal-400">{showPwdForm ? '▲' : '▼'}</span>
                    </button>
                    {showPwdForm && (
                        <div className="mt-4 space-y-3">
                            <input
                                type="password"
                                placeholder="Mot de passe actuel"
                                value={currentPwd}
                                onChange={e => setCurrentPwd(e.target.value)}
                                className="w-full border border-teal-200 rounded-xl px-4 py-2 text-sm"
                            />
                            <input
                                type="password"
                                placeholder="Nouveau mot de passe (6 caractères min.)"
                                value={newPwd}
                                onChange={e => setNewPwd(e.target.value)}
                                className="w-full border border-teal-200 rounded-xl px-4 py-2 text-sm"
                            />
                            {pwdMsg && (
                                <p className={`text-sm font-medium ${pwdMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                                    {pwdMsg.text}
                                </p>
                            )}
                            <Button
                                onClick={handleChangePassword}
                                disabled={pwdLoading}
                                className="w-full bg-teal-600 text-white hover:bg-teal-700 py-2"
                            >
                                {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Modifier le mot de passe'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bouton Déconnexion */}
                <Button
                    onClick={onLogout}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 py-6 text-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Se déconnecter
                </Button>
            </div>
        </div>
    );
}