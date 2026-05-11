import { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, X, FileText, Heart, Brain, Users, Activity } from "lucide-react";
import { getResources, Resource } from "../../services/resourceServices";

interface DocumentsPageProps {
  onNavigate: (page: string) => void;
    isLoggedIn: boolean;
    userEmail: string | null;

}

// On définit l'interface pour que TypeScript arrête de râler sur le type "any"
interface Category {
    id: string;
    name: string;
    icon: any; // Type 'any' ici car ce sont des composants Lucide
}

const categories: Category[] = [
    { id: "all", name: "Tous", icon: FileText },
    { id: "stress", name: "Stress", icon: Activity },
    { id: "anxiete", name: "Anxiété", icon: Heart },
    { id: "depression", name: "Dépression", icon: Brain },
    { id: "bien-etre", name: "Bien-être", icon: Heart },
    { id: "relations", name: "Relations", icon: Users }
];

export function DocumentsPage({ onNavigate, isLoggedIn, userEmail }: DocumentsPageProps) {
    // 1. On initialise avec une liste vide
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Resource | null>(null);

    // 2. LE CHARGEMENT AUTOMATIQUE
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getResources();
                setResources(data);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 3. FILTRAGE (On utilise 'resources' au lieu de 'mockDocuments')
    const filteredDocuments = resources.filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Juste après le calcul de filteredDocuments et avant le return principal
    if (selectedDocument) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pb-20">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <button
                        onClick={() => setSelectedDocument(null)}
                        className="flex items-center gap-2 text-teal-600 mb-6 hover:text-teal-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        <span>Retour à la bibliothèque</span>
                    </button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm mb-3">
                                {categories.find(c => c.id === selectedDocument.category)?.name || selectedDocument.category}
                            </span>
                            <h1 className="text-teal-800 mb-3 text-3xl font-bold">{selectedDocument.title}</h1>
                            <p className="text-muted-foreground mb-6 italic">{selectedDocument.description}</p>
                        </div>
                        <div className="prose prose-teal max-w-none">
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedDocument.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Gestion de l'attente
    if (loading) return <div className="p-10 text-center">Chargement de la bibliothèque...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => onNavigate("home")} className="mb-8 flex items-center gap-2 text-teal-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
        </button>
        {/* Header */}
        <div className="mb-6">
            <h1 className="mb-2 text-teal-800">Bibliothèque</h1>
            {/* Si on est connecté et qu'on a un email, on l'affiche */}
            {isLoggedIn && userEmail && (
                <p className="text-teal-600 font-medium mb-6 bg-teal-50 p-3 rounded-xl border border-teal-100 inline-block">
                    👤 Session active : {userEmail}
                </p>
            )}
            <p className="text-muted-foreground">
            Ressources et documents sur la santé mentale
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-teal-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Filter toggle - Only visible for logged in users */}
        {isLoggedIn ? (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-teal-100 rounded-xl mb-4 hover:bg-teal-50 transition-colors w-full justify-center"
          >
            <Filter className="w-5 h-5 text-teal-600" />
            <span className="text-teal-800">
              {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            </span>
          </button>
        ) : (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-teal-800 mb-2">
              🔒 Connectez-vous pour accéder aux filtres
            </p>
            <p className="text-sm text-teal-600">
              Les filtres par catégorie sont réservés aux utilisateurs connectés
            </p>
          </div>
        )}

        {/* Category filters - Only shown if logged in and filters are visible */}
        {isLoggedIn && showFilters && (
          <div className="mb-6 bg-white rounded-2xl p-4 border border-teal-100">
            <h3 className="text-sm font-medium text-teal-800 mb-3">Catégories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents list */}
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-teal-300 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun document trouvé</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const CategoryIcon = categories.find(c => c.id === doc.category)?.icon || FileText;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className="w-full bg-white rounded-2xl p-5 shadow-sm border border-teal-100 hover:shadow-md hover:border-teal-300 transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-teal-800 mb-1">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded-md">
                        {categories.find(c => c.id === doc.category)?.name || doc.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Results count */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""} trouvé{filteredDocuments.length > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
