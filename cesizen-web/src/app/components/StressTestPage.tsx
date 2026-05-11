import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";

interface StressEvent {
  id: number;
  event: string;
  value: number;
}

interface StressTestPageProps {
    onNavigate: (page: string) => void;
    onSaveResult: (result: any) => void;
    isLoggedIn: boolean;
}

// Test de Holmes et Rahe - événements de vie stressants
const stressEvents: StressEvent[] = [
  { id: 1, event: "Décès d'un conjoint", value: 100 },
  { id: 2, event: "Divorce", value: 73 },
  { id: 3, event: "Séparation conjugale", value: 65 },
  { id: 4, event: "Emprisonnement", value: 63 },
  { id: 5, event: "Décès d'un membre proche de la famille", value: 63 },
  { id: 6, event: "Maladie ou blessure personnelle", value: 53 },
  { id: 7, event: "Mariage", value: 50 },
  { id: 8, event: "Licenciement", value: 47 },
  { id: 9, event: "Réconciliation conjugale", value: 45 },
  { id: 10, event: "Retraite", value: 45 },
  { id: 11, event: "Changement dans la santé d'un membre de la famille", value: 44 },
  { id: 12, event: "Grossesse", value: 40 },
  { id: 13, event: "Difficultés sexuelles", value: 39 },
  { id: 14, event: "Arrivée d'un nouveau membre dans la famille", value: 39 },
  { id: 15, event: "Changement important au travail", value: 39 },
  { id: 16, event: "Changement de situation financière", value: 38 },
  { id: 17, event: "Décès d'un ami proche", value: 37 },
  { id: 18, event: "Changement de type de travail", value: 36 },
  { id: 19, event: "Changement dans le nombre de disputes conjugales", value: 35 },
  { id: 20, event: "Emprunt important", value: 31 },
  { id: 21, event: "Saisie d'un prêt ou d'une hypothèque", value: 30 },
  { id: 22, event: "Changement de responsabilités au travail", value: 29 },
  { id: 23, event: "Départ d'un enfant de la maison", value: 29 },
  { id: 24, event: "Problèmes avec la belle-famille", value: 29 },
  { id: 25, event: "Réussite personnelle remarquable", value: 28 },
  { id: 26, event: "Début ou arrêt de travail du conjoint", value: 26 },
  { id: 27, event: "Début ou fin des études", value: 26 },
  { id: 28, event: "Changement dans les conditions de vie", value: 25 },
  { id: 29, event: "Révision des habitudes personnelles", value: 24 },
  { id: 30, event: "Problèmes avec le patron", value: 23 },
  { id: 31, event: "Changement d'horaires ou de conditions de travail", value: 20 },
  { id: 32, event: "Changement de résidence", value: 20 },
  { id: 33, event: "Changement d'école", value: 20 },
  { id: 34, event: "Changement de loisirs", value: 19 },
  { id: 35, event: "Changement d'activités religieuses", value: 19 },
  { id: 36, event: "Changement d'activités sociales", value: 18 },
  { id: 37, event: "Emprunt modéré", value: 17 },
  { id: 38, event: "Changement dans les habitudes de sommeil", value: 16 },
  { id: 39, event: "Changement du nombre de réunions familiales", value: 15 },
  { id: 40, event: "Changement dans les habitudes alimentaires", value: 15 },
  { id: 41, event: "Vacances", value: 13 },
  { id: 42, event: "Fêtes de fin d'année", value: 12 },
  { id: 43, event: "Infractions mineures à la loi", value: 11 }
];

export const getInterpretation = (score: number) => {
    if (score < 150) {
        return {
            level: "Faible",
            color: "text-green-700",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            message: "Votre niveau de stress est relativement faible. Vous avez environ 30% de risque de développer une maladie liée au stress dans les deux prochaines années."
        };
    } else if (score < 300) {
        return {
            level: "Modéré",
            color: "text-amber-700",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            message: "Votre niveau de stress est modéré. Vous avez environ 50% de risque de développer une maladie liée au stress dans les deux prochaines années. Il serait bénéfique d'adopter des techniques de gestion du stress."
        };
    } else {
        return {
            level: "Élevé",
            color: "text-red-700",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            message: "Votre niveau de stress est élevé. Vous avez environ 80% de risque de développer une maladie liée au stress dans les deux prochaines années. Il est fortement recommandé de consulter un professionnel de santé mentale."
        };
    }
};
export function StressTestPage({ onNavigate, onSaveResult, isLoggedIn }: StressTestPageProps) {
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleEvent = (eventId: number) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const calculateScore = () => {
    return selectedEvents.reduce((total, eventId) => {
      const event = stressEvents.find(e => e.id === eventId);
      return total + (event?.value || 0);
    }, 0);
  };

  // je rajoute export pou le test unitaire 
 

  const score = calculateScore();
  const interpretation = getInterpretation(score);

  const handleSubmit = async () => {
      const totalScore = calculateScore();
      const resultLevel = getInterpretation(totalScore).level;

      // On appelle la fonction passée par App.tsx
      // Elle va faire le "POST" vers ton API .NET
      if (isLoggedIn && onSaveResult) {
          await onSaveResult({ score: totalScore, niveau: resultLevel });
        }

      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedEvents([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white p-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate("home")}
          className="mb-6 flex items-center gap-2 text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <h1 className="mb-2 text-teal-800">Test de stress</h1>
        <p className="text-muted-foreground mb-6">
          Échelle de Holmes et Rahe - Évaluez votre niveau de stress
        </p>

        {showResults && (
            <div className={`${interpretation.bgColor} ${interpretation.borderColor} border rounded-2xl p-6 mb-6`}>
                <h3 className={`mb-3 ${interpretation.color}`}>
                    Résultat : {score} points - Niveau {interpretation.level}
                </h3>
                <p className={interpretation.color}>
                    {interpretation.message}
                </p>

                {/* LES SEULES LIGNES À RAJOUTER : */}
                {!isLoggedIn && (
                    <p className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
                        Pour sauvegarder vos résultats et voir votre historique, n'hésitez pas à
                        <button onClick={() => onNavigate("auth")} className="underline font-bold ml-1">vous connectez ou à créer un compte</button>.
                    </p>
                )}

                <div className="mt-4">
                    <Button onClick={handleReset} className="bg-teal-600 hover:bg-teal-700 text-white">
                        Refaire le test
                    </Button>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 mb-6">
          <h3 className="mb-3 text-teal-800">Instructions</h3>
          <p className="text-muted-foreground mb-4">
            Cochez tous les événements qui se sont produits dans votre vie au cours des 12 derniers mois.
            Chaque événement a une valeur de stress associée qui sera additionnée pour obtenir votre score total.
          </p>
          <div className="bg-teal-50 rounded-lg p-4">
            <p className="text-teal-800">
              {selectedEvents.length} événement{selectedEvents.length > 1 ? 's' : ''} sélectionné{selectedEvents.length > 1 ? 's' : ''}
              {selectedEvents.length > 0 && ` • Score actuel : ${score} points`}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {stressEvents.map(event => (
            <div
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                selectedEvents.includes(event.id)
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-teal-100 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => toggleEvent(event.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-foreground">{event.event}</p>
                  <p className="text-muted-foreground">{event.value} points</p>
                </div>
                {selectedEvents.includes(event.id) && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-6 bg-white rounded-2xl p-6 shadow-lg border border-teal-200">
          <Button 
            onClick={handleSubmit}
            disabled={selectedEvents.length === 0}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
          >
            Voir mes résultats
          </Button>
        </div>
      </div>
    </div>
  );
}
