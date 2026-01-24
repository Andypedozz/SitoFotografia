import { orm, Progetto, Media, Utente } from "./src/db/models.js"
import fs from "node:fs"
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url"

function fillDb() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const projectsData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/progetti.json")))
    const mediaData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/media.json")))
    const userData = JSON.parse(fs.readFileSync(join(__dirname, "/mockdata/utenti.json")))

    projectsData.forEach(row => {
        Progetto.create(row);
    })
    mediaData.forEach(row => {
        Media.create(row);
    })
    userData.forEach(row => {
        Utente.create(row);
    })
}

fillDb();