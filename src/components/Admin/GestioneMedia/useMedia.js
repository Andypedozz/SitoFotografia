import { useCallback } from "react";
import { create, destroy, getAll } from "../../../scripts/mediaApi";

export function useMedia() {
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==================== API CALLS ====================

    /** 
     * GET /api/media
     * Ottieni tutti i media
     *
     */    
    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getAll();
            setMedia(data);
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Errore fetch media:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * POST /api/media
     * Crea un nuovo media
     * @param {Object} mediaData - Dati del media da creare
     */
    const createMedia = async (mediaData) => {
        try {
            const newMedia = await create(mediaData);
            setMedia(prev => [...prev, newMedia]);
            return { success: true };
        } catch (err) {
            console.error('Errore creazione media:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * DELETE /api/media
     * Elimina un media
     * @param {number} id - ID del media da eliminare
     */
    const deleteMedia = async (id) => {
        try {
            const response = await destroy(id);
            setMedia(prev => prev.filter(m => m.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Errore eliminazione media:', err);
            return { success: false, error: err.message };
        }
    }

    // ==================== HANDLERS ====================
    
}