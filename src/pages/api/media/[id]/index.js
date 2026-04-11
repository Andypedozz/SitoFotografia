import fs from "node:fs"
import { jsonResponse, handleError } from "../../../../scripts/responseUtils.js";
import { db } from "../../../../db/db_knex.js"

export async function DELETE({ request, params }) {
    try {
        const { id } = params;

        // Delete the file
        const media = await db("Media").select("*").where("id", id).first();

        fs.rmSync("./public/images/" + media.nome);

        // Delete from database
        const result = await db("Media").delete().where("id", id);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}