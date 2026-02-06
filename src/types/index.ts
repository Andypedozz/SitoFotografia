export interface Project {
    id: number;
    nome: string;
    descrizione: string;
    slug: string;
    copertina: string;
}

export interface Media {
    id: number;
    nome: string;
    percorso: string;
    tipo: string;
    projectId: number;
}