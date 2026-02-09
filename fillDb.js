import fs from "node:fs"
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url"
import { query } from "./src/db/db_utils.js";
import { db } from "./src/db/db.js";

export async function fillDb() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const projectsData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/progetti.json")))
    const mediaData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/media.json")))
    const userData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/utenti.json")))
    
    try {
        const insertProject = "INSERT INTO Progetto (nome, slug, copertina, homepage) VALUES (?, ?, ?, ?)";
        projectsData.forEach(project => {
            query(db, insertProject, Object.values(project))
        })
        
        const insertMedia = "INSERT INTO Media (nome, percorso, tipo, idProgetto) VALUES (?, ?, ?, ?)";
        mediaData.forEach(media => {
            query(db, insertMedia, Object.values(media))
        })
        
        const insertUser = "INSERT INTO Utente (email, password_hash, ruolo) VALUES (?, ?, ?)";
        userData.forEach(user => {
            query(db, insertUser, Object.values(user))
        })
    } catch (error) {
        console.error(error);
    }
}

fillDb()