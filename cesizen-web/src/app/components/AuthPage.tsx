import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import api from "@/api/axios";

// L'INTERFACE : Le contrat qui définit ce que le composant accepte
interface AuthPageProps {
    onNavigate: (page: string) => void;
    onLogin: (email: string, role: string) => void; // AJOUT CRUCIAL ICI
}

export function AuthPage({ onNavigate, onLogin }: AuthPageProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                // Appel API vers ton backend .NET
                const response = await api.post("/Users/login", { email, password });

                // Stockage du Token JWT
                const token = response.data.token;
                const role = response.data.role; // On récup le role 
                localStorage.setItem("token", token);

                // EXECUTION : On informe App.tsx du succès
                onLogin(email, role);

                // NAVIGATION : Redirection vers l'espace membre
                onNavigate("documents");
            } else {
                await api.post("/Users/register", { displayName: name, email, password });
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Identifiants incorrects.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-6">
            <div className="max-w-md mx-auto">
                <button onClick={() => onNavigate("home")} className="mb-8 flex items-center gap-2 text-teal-700">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Retour</span>
                </button>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-teal-100">
                    <h2 className="mb-6 text-center text-teal-800 font-bold text-2xl">
                        {isLogin ? "Connexion" : "Inscription"}
                    </h2>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-teal-600">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isLogin ? "Se connecter" : "S'inscrire"}
                        </Button>
                    </form>

                    <button onClick={() => setIsLogin(!isLogin)} className="mt-6 w-full text-center text-teal-600 text-sm">
                        {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Connexion"}
                    </button>
                </div>
            </div>
        </div>
    );
}