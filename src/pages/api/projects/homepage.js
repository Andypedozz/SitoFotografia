import { db } from "../../../db/db.js";
import { jsonResponse, handleError } from "../../../scripts/responseUtils";

// GET homepage projects
export async function GET({ request }) {
    try {
        const result = await db("Progetto").select("*").where("homepage", 1);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/projects/homepage
export async function PUT({ request }) {
    try {
        const { projectIds } = await request.json();
        await db("Progetto").update({ homepage: 1 }).whereIn("id", projectIds);
        await db("Progetto").update({ homepage: 0 }).whereNotIn("id", projectIds);
        return jsonResponse({ success: true });
    } catch (error) {
        return handleError(error);
    }
}