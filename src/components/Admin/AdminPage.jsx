// AdminPage.jsx
import { useState } from "react";
import "../../styles/tailwind.css";
import GestioneMedia from "./GestioneMedia/GestioneMedia";
import GestioneProgetti from "./GestioneProgetti/GestioneProgetti";
import GestioneHomepage from "./GestioneHomepage/GestioneHomepage";
import Sidebar from "./common/Sidebar";
import Panel from "./common/Panel";

export default function AdminPage() {
    const [page, setPage] = useState("Gestione Progetti");

    const buttons = {
        "Gestione Progetti": () => setPage("Gestione Progetti"),
        "Gestione Media": () => setPage("Gestione Media"),
        "Gestione Homepage": () => setPage("Gestione Homepage")
    };

    const pages = {
        "Gestione Progetti": <GestioneProgetti />,
        "Gestione Media": <GestioneMedia />,
        "Gestione Homepage": <GestioneHomepage />
    };

    // Funzione per ottenere l'icona/indicatore in base alla pagina corrente
    const getPageIcon = (pageName) => {
        const icons = {
            "Gestione Progetti": "📊",
            "Gestione Media": "🎬",
            "Gestione Homepage": "🏠"
        };
        return icons[pageName] || "📄";
    };

    return (
        <div className="min-h-screen bg-[rgb(19,19,19)] text-white flex">
            {/* Sidebar fissa */}
            <Sidebar buttons={buttons} setPage={setPage} currentPage={page} />
            
            {/* Area contenuto principale con margin per la sidebar */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="p-8">
                    {/* Header con breadcrumb e info pagina */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-white flex items-center">
                                <span className="text-3xl mr-3">{getPageIcon(page)}</span>
                                {page}
                            </h1>
                            <span className="px-2 py-1 bg-red-600/10 border border-red-600/30 rounded text-xs text-red-600">
                                {Object.keys(buttons).indexOf(page) + 1}/{Object.keys(buttons).length}
                            </span>
                        </div>
                        
                        {/* Indicatore di sistema */}
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-gray-500">Sistema attivo</span>
                        </div>
                    </div>

                    {/* Container principale con Panel */}
                    <Panel 
                        variant="elevated" 
                        padding="large"
                        className="w-full"
                    >
                        {/* Indicatore di pagina corrente */}
                        <div className="absolute top-4 right-4 text-xs text-red-600/30 font-mono">
                            {page.toLowerCase().replace(/\s+/g, '-')}
                        </div>

                        {/* Render della pagina selezionata */}
                        <div className="relative">
                            {pages[page]}
                        </div>
                    </Panel>

                    {/* Footer area (opzionale) */}
                    <div className="mt-8 text-xs text-gray-700 flex justify-between items-center">
                        <span>© 2024 DARK GUI - Admin Panel</span>
                        <span className="text-red-600/50">v2.0.1</span>
                    </div>
                </div>
            </main>
        </div>
    );
}