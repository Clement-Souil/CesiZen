import { Heart, BookOpen, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface HomePageProps {
    onNavigate: (page: string) => void;
    isLoggedIn: boolean;
}

export function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
    // LOGIQUE : Si l'utilisateur a déjà un token, on le redirige 
    // directement vers son espace (Dashboard) pour lui éviter un clic inutile.
    /*useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            onNavigate("dashboard"); // Optionnel : à activer si tu veux ce comportement
        }
    }, [onNavigate]);*/

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-6">
            <div className="max-w-2xl mx-auto">

                {/* Hero Section */}
                <header className="text-center mb-12 pt-8">
                    <div className="mb-6">
                        <div className="w-20 h-20 mx-auto bg-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-200">
                            <Heart className="w-10 h-10 text-white" aria-hidden="true" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-teal-900">Bienvenue sur CESIZen</h1>
                    <p className="text-teal-700/70 mb-8 max-w-md mx-auto text-lg">
                        Votre espace bien-être pour prendre soin de votre santé mentale au quotidien
                    </p>
                </header>

                {/* Features - LOGIQUE : Utilisation de balises <button> pour l'accessibilité au clavier */}
                <section className="grid gap-4 mb-8">
                    <button
                        onClick={() => onNavigate("documents")}
                        className="w-full text-left bg-white rounded-2xl p-6 shadow-sm border border-teal-100 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 transition-colors">
                                <BookOpen className="w-6 h-6 text-teal-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1 text-teal-800">Bibliothèque</h3>
                                <p className="text-gray-500">
                                    Consultez des ressources et documents sur la santé mentale
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate("test")}
                        className="w-full text-left bg-white rounded-2xl p-6 shadow-sm border border-teal-100 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 transition-colors">
                                <Brain className="w-6 h-6 text-teal-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1 text-teal-800">Test de stress</h3>
                                <p className="text-gray-500">
                                    Évaluez votre niveau de stress avec le test Holmes et Rahe
                                </p>
                            </div>
                        </div>
                    </button>
                </section>

                {!isLoggedIn && (
                    <section className="bg-teal-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-teal-900/10">
                        <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
                        <p className="mb-6 opacity-90 text-teal-50">
                            Accédez à des fonctionnalités personnalisées et filtrez les documents selon vos besoins
                        </p>
                        <Button
                            onClick={() => onNavigate("auth")}
                            className="bg-white text-teal-600 hover:bg-teal-50 w-full max-w-xs py-4 text-lg shadow-md"
                        >
                            Se connecter / S'inscrire
                        </Button>
                    </section>
                )}
            </div>
        </div>
    );
}