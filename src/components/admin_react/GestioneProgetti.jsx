// GestioneProgetti.jsx
import { useState } from "react";
import Panel from "./Panel";
import Table from "./Table";
import FormGroup from "./FormGroup";

export default function GestioneProgetti() {

    const addProjectFields = [
        {
            id: 'nome',
            name: 'Nome',
            label: 'Nome Progetto',
            type: 'input',
            inputType: 'text',
            placeholder: 'Nome progetto...'
        },
        {
            id: 'descrizione',
            name: 'Descrizione',
            label: 'Descrizione Progetto',
            type: 'input',
            inputType: 'text',
            placeholder: 'Descrizione progetto...'
        },
        {
            id: 'slug',
            name: 'Slug',
            label: 'Slug Progetto',
            type: 'input',
            inputType: 'text',
            placeholder: 'Slug progetto...'
        },
    ]
    
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        descrizione: '',
        slug: '',
        copertina: ''
    });

    // Dati mock dei progetti
    const [progetti, setProgetti] = useState([
        {
            id: 1,
            nome: "EcoMarket",
            descrizione: "Piattaforma e-commerce per prodotti sostenibili",
            slug: "ecomarket",
            copertina: "eco-market.jpg"
        },
        {
            id: 2,
            nome: "CityGuard",
            descrizione: "Sistema di monitoraggio ambientale urbano",
            slug: "cityguard",
            copertina: "city-guard.jpg"
        },
        {
            id: 3,
            nome: "SmartLearn",
            descrizione: "Piattaforma di e-learning con AI integrata",
            slug: "smartlearn",
            copertina: "smart-learn.jpg"
        },
        {
            id: 4,
            nome: "HealthTrack",
            descrizione: "App per il monitoraggio della salute personale",
            slug: "healthtrack",
            copertina: "health-track.jpg"
        },
        {
            id: 5,
            nome: "ArtSpace",
            descrizione: "Galleria virtuale per artisti emergenti",
            slug: "artspace",
            copertina: "art-space.jpg"
        },
        {
            id: 6,
            nome: "FinFlow",
            descrizione: "Dashboard per la gestione delle finanze personali",
            slug: "finflow",
            copertina: "fin-flow.jpg"
        }
    ]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingProject) {
            // Modifica progetto esistente
            setProgetti(prev => prev.map(p =>
                p.id === editingProject.id
                    ? { ...p, ...formData }
                    : p
            ));
            console.log('Progetto modificato:', { ...editingProject, ...formData });
        } else {
            // Nuovo progetto
            const newProject = {
                id: progetti.length + 1,
                ...formData
            };
            setProgetti(prev => [...prev, newProject]);
            console.log('Nuovo progetto creato:', newProject);
        }

        // Reset form
        setFormData({ nome: '', descrizione: '', slug: '', copertina: '' });
        setEditingProject(null);
        setShowForm(false);
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            nome: project.nome,
            descrizione: project.descrizione,
            slug: project.slug,
            copertina: project.copertina
        });
        setShowForm(true);
    };

    const handleDelete = (project) => {
        if (window.confirm(`Sei sicuro di voler eliminare il progetto "${project.nome}"?`)) {
            setProgetti(prev => prev.filter(p => p.id !== project.id));
            console.log('Progetto eliminato:', project);
        }
    };

    const handleDuplicate = (project) => {
        const newProject = {
            ...project,
            id: progetti.length + 1,
            nome: `${project.nome} (copia)`,
            slug: `${project.slug}-copia`
        };
        setProgetti(prev => [...prev, newProject]);
        console.log('Progetto duplicato:', newProject);
    };

    // Campi del form
    const formFields = [
        {
            id: 'nome',
            name: 'nome',
            label: 'Nome Progetto',
            type: 'input',
            inputType: 'text',
            placeholder: 'Inserisci il nome del progetto',
            value: formData.nome,
            onChange: handleInputChange,
            required: true,
            description: 'Il nome del progetto sarà usato per identificarlo'
        },
        {
            id: 'descrizione',
            name: 'descrizione',
            label: 'Descrizione',
            type: 'textarea',
            placeholder: 'Descrivi il progetto...',
            rows: 3,
            value: formData.descrizione,
            onChange: handleInputChange,
            required: true
        },
        {
            id: 'slug',
            name: 'slug',
            label: 'Slug',
            type: 'input',
            inputType: 'text',
            placeholder: 'slug-del-progetto',
            value: formData.slug,
            onChange: handleInputChange,
            required: true,
            description: 'Identificatore unico per URL (generato automaticamente)'
        },
        {
            id: 'copertina',
            name: 'copertina',
            label: 'Copertina',
            type: 'input',
            inputType: 'text',
            placeholder: 'nome-file.jpg',
            value: formData.copertina,
            onChange: handleInputChange,
            description: 'Nome del file dell\'immagine di copertina'
        }
    ];

    // Configurazione delle colonne della tabella
    const columns = [
        {
            key: 'id',
            label: 'ID',
            type: 'number',
            sortable: true
        },
        {
            key: 'nome',
            label: 'Nome Progetto',
            type: 'text',
            sortable: true,
            render: (value) => (
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <span className="font-medium text-white">{value}</span>
                </div>
            )
        },
        {
            key: 'descrizione',
            label: 'Descrizione',
            type: 'text',
            render: (value) => (
                <span className="text-gray-300 text-sm line-clamp-2">{value}</span>
            )
        },
        {
            key: 'slug',
            label: 'Slug',
            type: 'text',
            render: (value) => (
                <span className="text-gray-400 font-mono text-xs">/{value}</span>
            )
        },
        {
            key: 'copertina',
            label: 'Copertina',
            type: 'image',
            render: (value) => (
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">🖼️</span>
                    <span className="text-gray-500 text-xs">{value}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Azioni',
            render: (_, row) => (
                <div className="flex space-x-3">
                    <button
                        className="text-red-600 hover:text-red-500 transition-colors text-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        title="Modifica"
                    >
                        ✎
                    </button>
                    <button
                        className="text-red-600 hover:text-red-500 transition-colors text-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(row);
                        }}
                        title="Duplica"
                    >
                        📋
                    </button>
                    <button
                        className="text-red-600 hover:text-red-500 transition-colors text-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        title="Elimina"
                    >
                        🗑
                    </button>
                </div>
            )
        }
    ];

    return (
        <Panel>
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <span className="text-3xl mr-3">📊</span>
                        Gestione Progetti
                    </h1>
                    <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                        {progetti.length} progetti
                    </span>
                </div>

                {/* Pulsante per nuovo progetto */}
                <button
                    onClick={() => {
                        setEditingProject(null);
                        setFormData({ nome: '', descrizione: '', slug: '', copertina: '' });
                        setShowForm(!showForm);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg 
                             hover:bg-red-700 transition-colors text-sm font-medium"
                >
                    <span>{showForm ? '✕' : '+'}</span>
                    <span>{showForm ? 'Chiudi' : 'Nuovo Progetto'}</span>
                </button>
            </header>

            {/* Tabella progetti */}
            <Table
                columns={columns}
                data={progetti}
                variant="default"
                striped={true}
                hoverable={true}
                sortable={true}
                onRowClick={(row) => console.log('Progetto selezionato:', row)}
                rowsPerPage={5}
                showPagination={true}
            />

            {/* Form per nuovo/modifica progetto */}
            {showForm && (
                <div className="mt-8 border-t border-red-900/30 pt-8">
                    <FormGroup
                        title={editingProject ? '✎ Modifica Progetto' : '➕ Nuovo Progetto'}
                        fields={formFields}
                        onSubmit={handleSubmit}
                        submitLabel={editingProject ? 'Aggiorna Progetto' : 'Crea Progetto'}
                        variant="default"
                    />
                </div>
            )}

            {/* Footer con statistiche aggiuntive */}
            <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span>📊 Totale progetti: {progetti.length}</span>
                    <span>📝 Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>Sincronizzato</span>
                    </div>
                    <span className="text-red-600/50">v2.0</span>
                </div>
            </div>
        </Panel>
    );
}