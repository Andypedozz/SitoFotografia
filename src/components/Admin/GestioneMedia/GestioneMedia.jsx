// GestioneMedia.jsx
import { useState } from "react";
import UploadMedia from "./UploadMedia";
import MediaContainer from "./MediaContainer";
import Panel from "../common/Panel";
import FormGroup from "../common/FormGroup";
import { useEffect } from "react";

/**
 * Struttura Media:
 * - id
 * - nome
 * - tipo
 * - percorso
 * - idProgetto
 */

export default function GestioneMedia() {
    const [mediaType, setMediaType] = useState("tutti");
    const [mediaItems, setMediaItems] = useState([]);

    useEffect(() => {
        async function fetchMedia() {
            const res = await fetch("/api/media");
            const media = await res.json();
            setMediaItems(media);
        }
        fetchMedia();
    }, [])

    const handleUpload = (files) => {
        console.log("File caricati:", files);
    };

    const handleDelete = async (id) => {
        const res = await fetch("api/media", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })
        setMediaItems(prev => prev.filter(item => item.id !== id));
    };

    const filteredMedia = mediaType === "tutti" 
        ? mediaItems 
        : mediaItems.filter(item => item.tipo === mediaType);

    return (
        <Panel>
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
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
                            <UploadMedia onUpload={handleUpload} />
                            
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
                                </div>
                            </div>
                        </FormGroup>
                    </div>

                    {/* Colonna destra - Media Container */}
                    <div className="lg:col-span-2">
                        <MediaContainer 
                            mediaItems={filteredMedia}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>
            </div>
        </Panel>
    );
}