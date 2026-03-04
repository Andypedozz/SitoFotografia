import { db } from "../../db/db.js";
import { query } from "../../db/db_utils.js";

export async function POST({ cookies }) {
    const sessionId = cookies.get("session")?.value;

    if (sessionId) {
        await query(
            db,
            "DELETE FROM Sessione WHERE id = ?",
            [sessionId]
        )
    }

    cookies.delete("session", { path: "/" });

    return new Response(JSON.stringify({ ok: true }));
}