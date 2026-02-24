import { useState } from "react";
import GestioneProgetti from "./GestioneProgetti";
import GestioneMedia from "./GestioneMedia";
import GestioneHomepage from "./GestioneHomepage";
import Sidebar from "./Sidebar";

export default function AdminPage() {

    const [page, setPage] = useState("Gestione Progetti");

    const buttons = {
        "Gestione Progetti": () => setPage("Gestione Progetti"),
        "Gestione Media": () => setPage("Gestione Media"),
        "Gestione Homepage": () => setPage("Gestione Homepage")
    }

    const pages = {
        "Gestione Progetti": <GestioneProgetti />,
        "Gestione Media": <GestioneMedia />,
        "Gestione Homepage": <GestioneHomepage />
    }

    return (
        <div>
            <Sidebar buttons={buttons}/>
            <div>
                {pages[page]}
            </div>
        </div>
    );
}