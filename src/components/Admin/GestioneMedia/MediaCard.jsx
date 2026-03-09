// MediaCard.jsx
export default function MediaCard({ media, onDelete, progetto }) {
    const getIcon = (tipo) => {
        return tipo === 'video' ? '🎥' : '🖼️';
    };

    const getColor = (tipo) => {
        return tipo === 'video' ? 'text-blue-500' : 'text-green-500';
    };

    // Determina il tipo di file dall'estensione o dal MIME type
    const getFileExtension = (filename) => {
        return filename.split('.').pop()?.toUpperCase() || 'FILE';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    return (
        <div className="group relative bg-black border border-red-900/30 rounded-lg overflow-hidden hover:border-red-600/50 transition-all duration-300">
            {/* Preview area */}
            <div className="aspect-video bg-linear-to-br from-red-950/20 to-black flex items-center justify-center relative">
                {media.percorso ? (
                    media.tipo === 'video' ? (
                        <video 
                            src={media.percorso} 
                            className="w-full h-full object-cover"
                            preload="metadata"
                        />
                    ) : (
                        <img 
                            src={media.percorso} 
                            alt={media.nome}
                            className="w-full h-full object-cover"
                        />
                    )
                ) : (
                    <span className={`text-4xl ${getColor(media.tipo)}`}>
                        {getIcon(media.tipo)}
                    </span>
                )}
                
                {/* Badge progetto */}
                {progetto && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 border border-red-600/30 rounded text-[8px] text-red-600/80">
                        {progetto.nome}
                    </div>
                )}
            </div>

            {/* Info overlay on hover */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button
                    onClick={() => window.open(media.percorso, '_blank')}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                    <span>🔍</span>
                    <span>Visualizza</span>
                </button>
                <button
                    onClick={() => onDelete(media.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                    <span>🗑</span>
                    <span>Elimina</span>
                </button>
            </div>

            {/* Dettagli */}
            <div className="p-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate" title={media.nome}>
                            {media.nome}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            {media.dimensione} • {formatDate(media.data)}
                        </p>
                    </div>
                    <span className="text-xs text-red-600/50 ml-2">
                        {media.tipo === 'video' ? 'HD' : '4K'}
                    </span>
                </div>

                {/* Metadati specifici */}
                <div className="mt-2 flex items-center space-x-2 text-[10px]">
                    {media.tipo === 'video' ? (
                        <>
                            <span className="px-1.5 py-0.5 bg-red-950/30 border border-red-900/30 rounded text-red-600/70">
                                ⏱️ {media.durata || '00:00'}
                            </span>
                            <span className="text-gray-700">•</span>
                            <span className="text-gray-600">{getFileExtension(media.nome)}</span>
                        </>
                    ) : (
                        <>
                            <span className="px-1.5 py-0.5 bg-red-950/30 border border-red-900/30 rounded text-red-600/70">
                                📐 {media.dimensioni || 'N/A'}
                            </span>
                            <span className="text-gray-700">•</span>
                            <span className="text-gray-600">{getFileExtension(media.nome)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Badge tipo */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium
                ${media.tipo === 'video' 
                    ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30' 
                    : 'bg-green-600/20 text-green-500 border border-green-600/30'
                }`}
            >
                {media.tipo === 'video' ? '🎬 VIDEO' : '🖼️ IMG'}
            </div>
        </div>
    );
}