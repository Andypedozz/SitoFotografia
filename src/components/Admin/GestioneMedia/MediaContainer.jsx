// MediaContainer.jsx
import MediaCard from './MediaCard';

export default function MediaContainer({ mediaItems, onDelete }) {
    return (
        <div className="bg-black/50 border border-red-900/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>
                    Libreria Media ({mediaItems.length})
                </h3>
                
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

            {/* Griglia delle media card */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                    <MediaCard
                        key={item.id}
                        media={item}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Messaggio quando non ci sono media */}
            {mediaItems.length === 0 && (
                <div className="py-12 text-center">
                    <span className="text-4xl block mb-3 text-gray-600">📭</span>
                    <p className="text-gray-500 text-sm">Nessun media trovato</p>
                    <p className="text-xs text-gray-700 mt-1">
                        Carica immagini o video utilizzando l'area di upload
                    </p>
                </div>
            )}
        </div>
    );
}