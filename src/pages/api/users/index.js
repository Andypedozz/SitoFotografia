import { db } from "../../../db/db.js";
import { handleError, jsonResponse } from "../../../scripts/responseUtils.js";


export async function GET({ request }) {
    try {
        const users = await db.execute("SELECT * FROM Utente");
        return jsonResponse(users);
    } catch (error) {
        return handleError(error);
    }
}