import { db } from "../../../../db/db";
import { query } from "../../../../db/db_utils";

export async function GET({ params }) {

    const projectId = params.id;
    let result;

    try {
        const sql = "SELECT * FROM Media WHERE idProgetto = ?";
        result = query(db, sql, [projectId]);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}