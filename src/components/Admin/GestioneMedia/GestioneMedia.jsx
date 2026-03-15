// GestioneMedia.jsx
import { useState, useEffect } from "react";
import UploadMedia from "./UploadMedia";
import MediaContainer from "./MediaContainer";
import Panel from "../common/Panel";
import FormGroup from "../common/FormGroup";

/**
 * Struttura Media:
 * - id
 * - nome
 * - tipo
 * - percorso
 * - idProgetto
 * - dimensione
 * - data
 * - durata (se video)
 * - dimensioni (se immagine)
 */

export default function GestioneMedia() {
    const [mediaType, setMediaType] = useState("tutti");
    const [mediaItems, setMediaItems] = useState([]);
    const [progetti, setProgetti] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch media e progetti
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [mediaRes, progettiRes] = await Promise.all([
                    fetch("/api/media"),
                    fetch("/api/projects")
                ]);
                
                const media = await mediaRes.json();
                const progetti = await progettiRes.json();
                
                setMediaItems(media);
                setProgetti(progetti);
            } catch (error) {
                console.error("Errore nel caricamento dei dati:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleUpload = async (files) => {
        if (!selectedProject) {
            alert("Seleziona un progetto prima di caricare i file");
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        });
        formData.append("idProgetto", selectedProject);

        try {
            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const obj = await res.json();
                const newMedia = obj.data;
                setMediaItems(prev => [...newMedia, ...prev]);
            } else {
                alert("Errore durante il caricamento");
            }
        } catch (error) {
            console.error("Errore upload:", error);
            alert("Errore durante il caricamento");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Sei sicuro di voler eliminare questo file?")) return;
        
        try {
            const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setMediaItems(prev => prev.filter(item => item.id !== id));
            } else {
                alert("Errore durante l'eliminazione");
            }
        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore durante l'eliminazione");
        }
    };

    const filteredMedia = mediaType === "tutti" 
        ? mediaItems 
        : mediaItems.filter(item => item.tipo === mediaType);

    // Statistiche per progetto
    const getProjectStats = () => {
        const stats = {};
        mediaItems.forEach(item => {
            const projectId = item.idProgetto;
            stats[projectId] = (stats[projectId] || 0) + 1;
        });
        return stats;
    };

    const projectStats = getProjectStats();

    if (isLoading) {
        return (
            <Panel>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Caricamento...</p>
                    </div>
                </div>
            </Panel>
        );
    }

    return (
        <Panel>
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <span className="text-3xl mr-3">🎬</span>
                        Gestione Media
                    </h1>
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        {mediaItems.length} file
                    </span>
                </div>
            </header>

            <div>
                {/* Layout a due colonne */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonna sinistra - Form di upload */}
                    <div className="lg:col-span-1">
                        <FormGroup
                            title="📤 Carica Media"
                            fields={[]}
                            onSubmit={(e) => e.preventDefault()}
                            submitLabel=""
                            variant="compact"
                        >
                            {/* Selezione progetto */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Progetto <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgb(19,19,19)] border border-red-900/30 rounded-lg text-white focus:outline-none focus:border-red-600 transition-all duration-300"
                                >
                                    <option value="">Seleziona un progetto</option>
                                    {progetti.map(progetto => (
                                        <option key={progetto.id} value={progetto.id}>
                                            {progetto.nome} ({projectStats[progetto.id] || 0} file)
                                        </option>
                                    ))}
                                </select>
                                {!selectedProject && (
                                    <p className="text-xs text-red-500 mt-1">
                                        ⚠️ Seleziona un progetto per abilitare l'upload
                                    </p>
                                )}
                            </div>

                            <UploadMedia 
                                onUpload={handleUpload} 
                                disabled={!selectedProject}
                            />
                            
                            {/* Selettore tipo media */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Filtra per tipo
                                </label>
                                <div className="flex space-x-2">
                                    {["tutti", "immagine", "video"].map((tipo) => (
                                        <button
                                            key={tipo}
                                            onClick={() => setMediaType(tipo)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                                ${mediaType === tipo 
                                                    ? 'bg-red-600 text-white' 
                                                    : 'bg-black border border-red-900/30 text-gray-400 hover:text-white hover:border-red-600/50'
                                                }`}
                                        >
                                            {tipo === "tutti" && "📁 Tutti"}
                                            {tipo === "immagine" && "🖼️ Immagini"}
                                            {tipo === "video" && "🎥 Video"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Statistiche rapide */}
                            <div className="mt-4 pt-4 border-t border-red-900/30">
                                <div className="text-xs text-gray-500 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Immagini:</span>
                                        <span className="text-white">{mediaItems.filter(m => m.tipo === "immagine").length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Video:</span>
                                        <span className="text-white">{mediaItems.filter(m => m.tipo === "video").length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Progetti con media:</span>
                                        <span className="text-white">{Object.keys(projectStats).length}</span>
                                    </div>
                                </div>
                            </div>
                        </FormGroup>
                    </div>

                    {/* Colonna destra - Media Container */}
                    <div className="lg:col-span-2">
                        <MediaContainer 
                            mediaItems={filteredMedia}
                            onDelete={handleDelete}
                            progetti={progetti}
                        />
                    </div>
                </div>
            </div>
        </Panel>
    );
}