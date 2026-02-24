export interface Progetto {
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

export interface Utente {
    id: number;
    email: string;
    password_hash: string;
    ruolo: string;
}

export interface ResponseMessage {
    success: boolean;
    message: string;
}