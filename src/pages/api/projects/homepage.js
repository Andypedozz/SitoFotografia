import { db } from "../../../db/db";
import { query } from "../../../db/db_utils";

// GET homepage projects
export async function GET({ request }) {
    let result;
    try {
        const sql = "SELECT * FROM Progetto WHERE homepage = 1";
        result = query(db, sql);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function PUT({ request }) {
    const { projectIds } = await request.json();
    let result;

    try {
        const sql = "UPDATE Progetto SET homepage = CASE WHEN id IN (?) THEN 1 ELSE 0 END";
        result = query(db, sql, [...projectIds]);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}