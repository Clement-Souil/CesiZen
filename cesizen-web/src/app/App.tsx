import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { DocumentsPage } from './components/DocumentsPage';
import { StressTestPage } from './components/StressTestPage';
import { BottomNav } from './components/BottomNav'; // Importation vérifiée
import { ProfilePage } from './components/ProfilePage'; 
import  AdminDashboard  from './components/AdminDashboard';
import api from '../api/axios';import { User } from 'lucide-react';
;

function App() {
    const navigate = useNavigate();
    const location = useLocation(); // Pour savoir sur quelle page on est

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));

    const [userEmail, setUserEmail] = useState<string | null>(null)

    // On crée une variable 'user' qui contiendra l'email et le rôle
    const [user, setUser] = useState<{ email: string, role: string } | null>(() => {
        const savedEmail = localStorage.getItem('userEmail');
        const savedRole = localStorage.getItem('userRole');
        return savedEmail && savedRole ? { email: savedEmail, role: savedRole } : null;
    });

    // On stabilise la navigation pour stopper la boucle infinie
    const handleNavigate = useCallback((page: string) => {
        const pathMap: Record<string, string> = {
            "home": "/",
            "auth": "/auth",
            "documents": "/documents",
            "test": "/test",
            "admin": "/admin" 
        };
        navigate(pathMap[page] || "/");
    }, [navigate]);

    // Modifie ta fonction handleLogin pour accepter le rôle
    const handleLogin = (email: string, role: string) => {
        console.log("Login réussi pour :", email, "Rôle :", role);
        setIsLoggedIn(true);
        setUserEmail(email);
        setUser({ email, role }); // On remplit notre nouvelle variable

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userRole', role); // On stocke le rôle
        navigate("/documents");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole'); // <--- Ajoute ça
        setIsLoggedIn(false);
        setUserEmail(null);
        setUser(null); // On vide la variable
        navigate("/");
    };

    //Fonction pour renrgistrer les tests de stress
    const handleSaveStressResult = async (result: { score: number; niveau: string }) => {
        // Si l'utilisateur n'est pas connecté, on ne tente pas l'appel API
        if (!isLoggedIn) {
            console.log("Utilisateur non connecté : Résultat affiché localement uniquement.");
            // On peut rediriger vers une page de résultats "invité" ou simplement rester sur la page
            // Pour l'instant, on laisse le test s'afficher sans rien bloquer
            return;
        }

        // Si l'utilisateur est connecté, on enregistre en base SQL
        try {
            await api.post('StressResults', {
                Score: result.score,
                Level: result.niveau
            });
            //navigate("/profile"); j'aime pas, pas clair
        } catch (error) {
            console.error("Erreur de sauvegarde :", error);
            alert("Impossible de sauvegarder dans votre historique. Vérifiez votre connexion.");
        }
    };

    // 2. On calcule la page actuelle pour la Navbar
    const currentPage = location.pathname.substring(1) || "home";

    return (
        <div className="flex flex-col min-h-screen">
            {/* Le contenu principal */}
            <main className="flex-grow pb-24">
                <Routes>
                    <Route path="/" element={<HomePage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />} />
                    <Route path="/auth" element={<AuthPage onNavigate={handleNavigate} onLogin={handleLogin} />} />
                    <Route path="/documents" element={<DocumentsPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} userEmail={userEmail} />} />
                    <Route path="/test" element={<StressTestPage onNavigate={handleNavigate} onSaveResult={handleSaveStressResult} isLoggedIn={isLoggedIn} />} />
                    <Route path="/profile" element={<ProfilePage userEmail={userEmail} onLogout={handleLogout} />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/" />} />

                </Routes>
            </main>

            {/* 3. On affiche la barre de navigation EN DEHORS des routes pour qu'elle soit fixe */}
            <BottomNav
                onNavigate={(id) => id === "auth" && isLoggedIn ? navigate("/profile") : handleNavigate(id)}
                isLoggedIn={isLoggedIn}
                currentPage={currentPage}
                userRole={user?.role} // On passe le rôle ici 
            />
        </div>
    );
}

export default App;