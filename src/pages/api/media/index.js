import { db } from "../../../db/db.js"
import { handleError, jsonResponse } from "../../../scripts/responseUtils.js";

// GET /api/media
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");

        // /api/media?id=xxx
        if(id) {
            const result = (await db.execute("SELECT * FROM Media WHERE id = ?", [id])).rows[0];
            return jsonResponse(result);
        }

        // /api/media?slug=xxx
        if(slug) {
            const project = (await db.execute("SELECT * FROM Progetto WHERE slug = ?", [slug])).rows[0];
            const result = (await db.execute("SELECT * FROM Media WHERE idProgetto = ?", [project.id])).rows;
            return jsonResponse(result);
        }

        // /api/media
        const result = (await db.execute("SELECT * FROM Media")).rows;
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/media
export async function POST({ request }) {
    try {
        const data = await request.json();
        const result = await db.execute("INSERT INTO Media (nome, idProgetto) VALUES (?, ?)", [data.nome, data.idProgetto]);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/media
export async function DELETE({ request }) {
    try {
        const { id } = await request.json();
        const result = await db.execute("DELETE FROM Media WHERE id = ?", [id]);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}