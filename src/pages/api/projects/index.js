import { handleError, jsonResponse } from "../../../scripts/responseUtils";
import { db } from "../../../db/db_knex"

// GET /api/projects
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const slug = url.searchParams.get("slug");
        const homepage = url.searchParams.get("homepage");

        // /api/projects?id=xxx
        if(id) {
            const result = await db("Progetto").select("*").where("id", id);
            return jsonResponse(result);
        }
        
        // /api/projects?slug=xxx
        if(slug) {
            const result = await db("Progetto").select("*").where("slug", slug);
            return jsonResponse(result);
        }

        if(homepage) {
            const result = await db("Progetto").select("*").where("homepage", homepage);
            return jsonResponse(result);
        }

        // /api/projects
        const result = await db("Progetto").select("*");
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/projects
export async function POST({ request }) {
    try {
        const data = await request.json();
        console.log(data);
        const newProject = await db("Progetto").insert(data).returning("*");
        return jsonResponse({
            success: true,
            data: newProject
        }, 201);
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/projects
export async function PUT({ request }) {
    try {
        const { id, ...data } = await request.json();

        if(!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        const updatedProject = await db("Progetto").update(data).where("id", id).returning("*").first();

        if(!updatedProject) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            data: updatedProject
        })
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/projects
export async function DELETE({ request }) {
    try {
        const { id } = await request.json();

        if(!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        const deleted = await db("Progetto").delete().where("id", id);

        if(!deleted) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            message: 'Progetto eliminato con successo'
        })
    } catch (error) {
        return handleError(error);
    }
}