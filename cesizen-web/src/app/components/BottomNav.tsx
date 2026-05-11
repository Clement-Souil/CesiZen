import { Home, BookOpen, Brain, User, ShieldCheck } from "lucide-react"; // Ajout de ShieldCheck

interface BottomNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    isLoggedIn: boolean;
    userRole?: string; // On ajoute le rôle ici
}

export function BottomNav({ currentPage, onNavigate, isLoggedIn, userRole }: BottomNavProps) {
    // 1. On définit les items de base
    const navItems = [
        { id: "home", label: "Accueil", icon: Home },
        { id: "documents", label: "Bibliothèque", icon: BookOpen },
        { id: "test", label: "Test", icon: Brain },
    ];

    // 2. On ajoute l'onglet Admin SEULEMENT si c'est un ADMIN
    if (isLoggedIn && userRole?.toUpperCase() === "ADMIN") {
        navItems.push({ id: "admin", label: "Admin", icon: ShieldCheck });
    }

    // 3. On ajoute l'onglet Profil à la fin
    navItems.push({ id: "auth", label: isLoggedIn ? "Profil" : "Compte", icon: User });

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-teal-100 shadow-lg">
            <div className="flex justify-around items-center h-20 max-w-4xl mx-auto px-2">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-teal-700 bg-teal-50'
                                    : 'text-gray-500 hover:text-teal-600'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                            <span className="text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}