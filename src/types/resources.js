const Progetto = {
    id: number,
    nome: string,
    descrizione: string,
    slug: string,
    copertina: string
}

const Media = {
    id: number,
    nome: string,
    percorso: string,
    tipo: string,
    projectId: number
}

const Utente = {
    id: number,
    email: string,
    password_hash: string,
    ruolo: string
}