// hooks/useProgetti.js
import { useState, useEffect, useCallback } from 'react';

const INITIAL_FORM_STATE = {
    nome: '',
    descrizione: '',
    slug: '',
    copertina: ''
};

export function useProgetti() {
    const [progetti, setProgetti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // ==================== API CALLS ====================
    
    const fetchProgetti = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // TODO: Implementare chiamata API
            // const response = await fetch('/api/projects');
            // if (!response.ok) throw new Error('Errore nel caricamento dei progetti');
            // const data = await response.json();
            // setProgetti(data);
            
            // Mock temporaneo - DA RIMUOVERE
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('TODO: Implementare fetch GET /api/projects');
            
        } catch (err) {
            setError(err.message);
            console.error('Errore fetch progetti:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createProgetto = async (projectData) => {
        try {
            // TODO: Implementare chiamata API
            console.log('TODO: Implementare fetch POST /api/projects', projectData);
            
            // Mock temporaneo - DA RIMUOVERE
            const newProject = {
                id: Date.now(),
                ...projectData
            };
            setProgetti(prev => [...prev, newProject]);
            
            return { success: true, data: newProject };
        } catch (err) {
            console.error('Errore creazione progetto:', err);
            return { success: false, error: err.message };
        }
    };

    const updateProgetto = async (id, projectData) => {
        try {
            // TODO: Implementare chiamata API
            console.log('TODO: Implementare fetch PUT /api/projects', { id, ...projectData });
            
            // Mock temporaneo - DA RIMUOVERE
            setProgetti(prev => prev.map(p =>
                p.id === id ? { ...p, ...projectData } : p
            ));
            
            return { success: true };
        } catch (err) {
            console.error('Errore aggiornamento progetto:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteProgetto = async (id) => {
        try {
            // TODO: Implementare chiamata API
            console.log('TODO: Implementare fetch DELETE /api/projects', { id });
            
            // Mock temporaneo - DA RIMUOVERE
            setProgetti(prev => prev.filter(p => p.id !== id));
            
            return { success: true };
        } catch (err) {
            console.error('Errore eliminazione progetto:', err);
            return { success: false, error: err.message };
        }
    };

    // ==================== HANDLERS ====================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Genera slug automaticamente dal nome (solo per nuovi progetti)
        if (name === 'nome' && !editingProject) {
            const slug = value
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (editingProject) {
            result = await updateProgetto(editingProject.id, formData);
        } else {
            result = await createProgetto(formData);
        }

        if (result.success) {
            setFormData(INITIAL_FORM_STATE);
            setEditingProject(null);
            setShowForm(false);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            nome: project.nome,
            descrizione: project.descrizione,
            slug: project.slug,
            copertina: project.copertina || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (project) => {
        if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project.nome}"?`)) {
            await deleteProgetto(project.id);
        }
    };

    const handleDuplicate = async (project) => {
        const { id, ...projectData } = project;
        const duplicatedProject = {
            ...projectData,
            nome: `${project.nome} (copia)`,
            slug: `${project.slug}-copia`
        };
        
        await createProgetto(duplicatedProject);
    };

    const resetForm = () => {
        setEditingProject(null);
        setFormData(INITIAL_FORM_STATE);
        setShowForm(!showForm);
    };

    // Carica progetti all'avvio
    useEffect(() => {
        fetchProgetti();
    }, [fetchProgetti]);

    return {
        // Stati
        progetti,
        isLoading,
        error,
        showForm,
        editingProject,
        formData,
        
        // Handlers
        handleInputChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleDuplicate,
        resetForm,
        fetchProgetti
    };
}