// src/pages/api/media/upload.js
import { db } from "../../../db/db.js"
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(process.cwd(), "public", "images");

// Assicura che la directory di upload esista
try {
    await fs.access(UPLOAD_DIR);
    console.info("[UPLOAD_INIT] Directory esistente:", UPLOAD_DIR);
} catch (err) {
    console.warn("[UPLOAD_INIT] Directory non trovata, creazione in corso:", UPLOAD_DIR);
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        console.info("[UPLOAD_INIT] Directory creata con successo");
    } catch (mkdirError) {
        console.error("[UPLOAD_INIT] Errore creazione directory", {
            path: UPLOAD_DIR,
            error: mkdirError.message,
            stack: mkdirError.stack
        });
        throw mkdirError;
    }
}

export async function POST({ request }) {
    try {
        console.info("[UPLOAD_START] Nuova richiesta upload");

        const formData = await request.formData();
        const files = formData.getAll("files");
        const idProgetto = formData.get("idProgetto");

        console.debug("[UPLOAD_DATA]", {
            idProgetto,
            numeroFile: files?.length || 0
        });

        // Validazioni
        if (!idProgetto) {
            console.warn("[VALIDATION_ERROR] idProgetto mancante");
            return new Response(
                JSON.stringify({ error: "ID progetto non specificato" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!files || files.length === 0) {
            console.warn("[VALIDATION_ERROR] Nessun file caricato", { idProgetto });
            return new Response(
                JSON.stringify({ error: "Nessun file caricato" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Verifica che il progetto esista
        const progetto = (await db.execute("SELECT * FROM Progetto WHERE id = ?", [idProgetto])).rows[0];

        if (!progetto) {
            console.warn("[DB_ERROR] Progetto non trovato", { idProgetto });
            return new Response(
                JSON.stringify({ error: "Progetto non trovato" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const uploadedMedia = [];

        for (const file of files) {
            console.info("[FILE_PROCESS_START]", {
                nome: file.name,
                tipo: file.type,
                size: formatFileSize(file.size)
            });

            // Validazione tipo file
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                console.warn("[VALIDATION_ERROR] Tipo file non supportato", {
                    fileName: file.name,
                    mime: file.type
                });

                return new Response(
                    JSON.stringify({ error: "Tipo file non supportato. Sono ammesse solo immagini e video." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            // Validazione dimensione
            if (file.size > 100 * 1024 * 1024) {
                console.warn("[VALIDATION_ERROR] File troppo grande", {
                    fileName: file.name,
                    size: formatFileSize(file.size)
                });

                return new Response(
                    JSON.stringify({ error: `File ${file.name} troppo grande. Massimo 100MB.` }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }

            const fileExtension = path.extname(file.name);
            const fileName = `${file.name}`;
            const filePath = path.join(UPLOAD_DIR, fileName);
            const publicPath = `/images/${fileName}`;

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                await fs.writeFile(filePath, buffer);

                console.info("[FILE_SAVED]", {
                    fileName,
                    path: filePath,
                    publicPath
                });
            } catch (writeError) {
                console.error("[FILE_WRITE_ERROR]", {
                    fileName,
                    path: filePath,
                    error: writeError.message,
                    stack: writeError.stack
                });
                throw writeError;
            }

            const tipo = file.type.startsWith("video/") ? "video" : "immagine";

            let durata = null;
            let dimensioni = null;

            if (tipo === "video") {
                durata = "00:00";
            } else {
                dimensioni = "1920x1080";
            }

            try {
                await db.execute(
                    "INSERT INTO Media (nome, tipo, percorso, idProgetto) VALUES (?, ?, ?, ?) ",
                    [file.name, tipo, publicPath, idProgetto]
                );

                const [newMedia] = (await db.execute(
                    "SELECT * FROM Media WHERE percorso = ?",
                    [publicPath]
                )).rows;

                console.info("[DB_INSERT_SUCCESS]", {
                    fileName,
                    idProgetto,
                    publicPath
                });

                uploadedMedia.push(newMedia);

            } catch (dbError) {
                console.error("[DB_ERROR]", {
                    fileName,
                    idProgetto,
                    query: "INSERT INTO Media...",
                    error: dbError.message,
                    stack: dbError.stack
                });
                throw dbError;
            }
        }

        console.info("[UPLOAD_SUCCESS]", {
            totaleFile: uploadedMedia.length,
            idProgetto
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: `${uploadedMedia.length} file caricati con successo`,
                data: uploadedMedia
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("[UPLOAD_FATAL_ERROR]", {
            message: error.message,
            stack: error.stack
        });

        return new Response(
            JSON.stringify({ 
                error: "Errore interno del server",
                details: error.message 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// Helper
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}