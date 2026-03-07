import { db } from "../../../db/db_knex.js"
import { handleError, jsonResponse } from "../../../scripts/responseUtils.js";

// GET /api/media
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");

        // /api/media?id=xxx
        if(id) {
            const result = await db("Media").select("*").where("id", id).first();
            return jsonResponse(result);
        }

        // /api/media?slug=xxx
        if(slug) {
            const project = await db("Progetto").select("*").where("slug", slug).first();
            const result = await db("Media").select("*").where("idProgetto", project.id);
            return jsonResponse(result);
        }

        // /api/media
        const result = await db("Media").select("*");
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/media
export async function POST({ request }) {
    try {
        const data = await request.json();
        const result = await db("Media").insert(data).returning("*").first();
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/media
export async function DELETE({ request }) {
    try {
        const { id } = await request.json();
        const result = await db("Media").delete().where("id", id);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}