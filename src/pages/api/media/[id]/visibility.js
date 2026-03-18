
import { db } from "../../../../db/db_knex.js";
import { jsonResponse, handleError } from "../../../../scripts/responseUtils.js";

export async function PATCH({ request, params }) {
    try {
        const { id } = params;
        const { visible } = await request.json();
        const result = await db("Media").update({ visible }).where("id", id);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}