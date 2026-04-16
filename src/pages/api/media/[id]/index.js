import fs from "node:fs"
import { jsonResponse, handleError } from "../../../../scripts/responseUtils.js";
import { db } from "../../../../db/db.js"

export async function DELETE({ request, params }) {
    try {
        const { id } = params;

        // Delete the file
        const media = (await db.execute("SELECT * FROM Media WHERE id = ?", [id])).rows[0];

        fs.rmSync("./public/images/" + media.nome);

        // Delete from database
        const result = await db.execute("DELETE FROM Media WHERE id = ?", [id]);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}