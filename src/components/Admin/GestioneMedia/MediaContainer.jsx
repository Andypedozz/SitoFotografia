// MediaContainer.jsx
import MediaCard from './MediaCard';
import { useState } from 'react';

export default function MediaContainer({ mediaItems, onDelete, progetti }) {
    const [filterProject, setFilterProject] = useState("tutti");

    // Crea una mappa dei progetti per ID
    const progettiMap = progetti.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {});

    // Filtra per progetto selezionato
    const filteredByProject = filterProject === "tutti" 
        ? mediaItems 
        : mediaItems.filter(item => item.idProgetto === parseInt(filterProject));

    // Raggruppa media per progetto
    const mediaByProject = filteredByProject.reduce((acc, item) => {
        const projectId = item.idProgetto;
        if (!acc[projectId]) {
            acc[projectId] = {
                progetto: progettiMap[projectId],
                items: []
            };
        }
        acc[projectId].items.push(item);
        return acc;
    }, {});

    return (
        <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                    Libreria Media ({filteredByProject.length})
                </h3>

                {/* Filtro per progetto */}
                <div className="flex items-center space-x-3">
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="px-3 py-1.5 bg-black border border-red-900/30 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-red-600"
                    >
                        <option value="tutti">📁 Tutti i progetti</option>
                        {progetti.map(progetto => (
                            <option key={progetto.id} value={progetto.id}>
                                {progetto.nome}
                            </option>
                        ))}
                    </select>

                    {/* Opzioni di visualizzazione */}
                    <div className="flex items-center space-x-2">
                        <button className="p-1.5 bg-red-600/10 border border-red-900/30 rounded text-red-600">
                            <span className="text-sm">🔲</span>
                        </button>
                        <button className="p-1.5 hover:bg-red-600/10 border border-transparent hover:border-red-900/30 rounded text-gray-500 hover:text-white transition-all">
                            <span className="text-sm">☰</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Griglia delle media card raggruppate per progetto */}
            <div className="bg-black/50 border border-red-900/30 rounded-lg p-6 flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto pr-2">
                    {Object.keys(mediaByProject).length > 0 ? (
                        Object.entries(mediaByProject).map(([projectId, group]) => (
                            <div key={projectId} className="mb-6 last:mb-0">
                                {filterProject === "tutti" && (
                                    <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-black/90 py-2 z-10">
                                        <span className="text-sm text-red-600">📁</span>
                                        <h4 className="text-white font-medium">
                                            {group.progetto?.nome || 'Progetto sconosciuto'}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            ({group.items.length} file)
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {group.items.map((item) => (
                                        <MediaCard
                                            key={item.id}
                                            media={item}
                                            onDelete={onDelete}
                                            progetto={group.progetto}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <span className="text-4xl block mb-3 text-gray-600">📭</span>
                            <p className="text-gray-500 text-sm">Nessun media trovato</p>
                            <p className="text-xs text-gray-700 mt-1">
                                {filterProject === "tutti" 
                                    ? "Carica immagini o video utilizzando l'area di upload"
                                    : "Nessun media per questo progetto"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}