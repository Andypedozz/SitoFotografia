import { Media, Progetto, Utente } from "./src/lib/db.js"
import fs from "node:fs"
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url"

export async function fillDb() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const projectsData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/progetti.json")))
    const mediaData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/media.json")))
    const userData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/utenti.json")))
    
    try {
        // Inserimento progetti mock
        const projects = await Progetto.bulkCreate(projectsData, {
            validate: true,          // Valida ogni record
            individualHooks: false,  // Non eseguire hook per ogni record (più veloce)
            returning: true,         // Restituisce i record inseriti (solo PostgreSQL)
            ignoreDuplicates: false  // Ignora duplicati (se unique constraint)
        })
        console.log(`${projects.length} progetti inseriti con successo`);
        console.log('ID progetti creati:', projects.map(pj => pj.id));
        
        // Inserimento media mock
        const media = await Media.bulkCreate(mediaData, {
            validate: true,          // Valida ogni record
            individualHooks: false,  // Non eseguire hook per ogni record (più veloce)
            returning: true,         // Restituisce i record inseriti (solo PostgreSQL)
            ignoreDuplicates: false  // Ignora duplicati (se unique constraint)
        })
        console.log(`${media.length} media inseriti con successo`);
        console.log('ID media creati:', media.map(md => md.id));
        
        // Inserimento utenti mock
        const users = await Utente.bulkCreate(userData, {
            validate: true,          // Valida ogni record
            individualHooks: false,  // Non eseguire hook per ogni record (più veloce)
            returning: true,         // Restituisce i record inseriti (solo PostgreSQL)
            ignoreDuplicates: false  // Ignora duplicati (se unique constraint)
        })
        console.log(`${users.length} utenti inseriti con successo`);
        console.log('ID utenti creati:', users.map(u => u.id));
    } catch (error) {
        console.error('Errore durante bulkCreate:', error);
    }
}