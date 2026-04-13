// src/pages/api/media/upload.js
import { db } from "../../../db/db.js";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(process.cwd(), "public", "images");

// Assicura che la directory di upload esista
try {
    await fs.access(UPLOAD_DIR);
} catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files");
        const idProgetto = formData.get("idProgetto");

        // Validazioni
        if (!idProgetto) {
            return new Response(
                JSON.stringify({ error: "ID progetto non specificato" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!files || files.length === 0) {
            return new Response(
                JSON.stringify({ error: "Nessun file caricato" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Verifica che il progetto esista
        const progetto = await db.execute("SELECT * FROM Progetto WHERE id = ?", [idProgetto]);
        if (!progetto) {
            return new Response(
                JSON.stringify({ error: "Progetto non trovato" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const uploadedMedia = [];

        for (const file of files) {
            // Validazione tipo file
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                return new Response(
                    JSON.stringify({ error: "Tipo file non supportato. Sono ammesse solo immagini e video." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // Validazione dimensione (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                return new Response(
                    JSON.stringify({ error: `File ${file.name} troppo grande. Massimo 100MB.` }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // Genera nome file univoco
            const fileExtension = path.extname(file.name);
            // const fileName = `${uuidv4()}${fileExtension}`;
            const fileName = `${file.name}`;
            const filePath = path.join(UPLOAD_DIR, fileName);
            const publicPath = `/images/${fileName}`;

            // Salva il file
            const buffer = Buffer.from(await file.arrayBuffer());
            await fs.writeFile(filePath, buffer);

            // Determina il tipo di media
            const tipo = file.type.startsWith("video/") ? "video" : "immagine";

            // Calcola dimensioni in formato leggibile
            const dimensione = formatFileSize(file.size);

            // Estrai metadati specifici
            let durata = null;
            let dimensioni = null;

            if (tipo === "video") {
                // TODO: Se vuoi estrarre la durata del video, puoi usare librerie come ffmpeg
                durata = "00:00"; // Placeholder
            } else {
                // TODO: Se vuoi estrarre le dimensioni dell'immagine, puoi usare sharp o simile
                dimensioni = "1920x1080"; // Placeholder
            }

            // Inserisci nel database
            const [newMedia] = await db("Media").insert({
                nome: file.name,
                tipo: tipo,
                percorso: publicPath,
                idProgetto: idProgetto,
            }).returning("*");

            uploadedMedia.push(newMedia);
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `${uploadedMedia.length} file caricati con successo`,
                data: uploadedMedia
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Errore durante l'upload:", error);
        return new Response(
            JSON.stringify({ 
                error: "Errore interno del server",
                details: error.message 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// Funzione helper per formattare la dimensione del file
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}