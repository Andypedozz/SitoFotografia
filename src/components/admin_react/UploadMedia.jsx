// UploadMedia.jsx
import { useState, useCallback } from 'react';

export default function UploadMedia({ onUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [onUpload]);

    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [onUpload]);

    const handleFiles = (files) => {
        // Simulazione upload
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setUploadProgress(null), 1000);
                    onUpload(files);
                    return null;
                }
                return prev + 10;
            });
        }, 200);
    };

    return (
        <div className="space-y-4">
            {/* Area drag & drop */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-lg p-8
                    transition-all duration-300 cursor-pointer
                    ${isDragging 
                        ? 'border-red-600 bg-red-600/10' 
                        : 'border-red-900/30 hover:border-red-600/50 hover:bg-red-600/5'
                    }
                `}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="text-center">
                    <div className="text-4xl mb-3">
                        {isDragging ? '📂' : '📁'}
                    </div>
                    <p className="text-gray-400 text-sm mb-1">
                        {isDragging 
                            ? 'Rilascia i file qui' 
                            : 'Trascina i file qui o clicca per selezionare'
                        }
                    </p>
                    <p className="text-xs text-gray-600">
                        Supporta immagini e video (max 100MB)
                    </p>
                </div>
            </div>

            {/* Barra di progresso */}
            {uploadProgress !== null && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Caricamento in corso...</span>
                        <span className="text-red-600">{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-red-950/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Lista formati supportati */}
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">JPG</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">PNG</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">GIF</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">MP4</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">MOV</span>
                <span className="px-2 py-1 bg-black border border-red-900/30 rounded">WEBM</span>
            </div>
        </div>
    );
}