import { db } from "./db/db.js";
import { query } from "./db/db_utils.js"

export async function onRequest({ cookies, locals }, next) {
    const sessionId = cookies.get("session")?.value;

    if (!sessionId) {
        locals.user = null;
        return next();
    }

    const session = await query(
        db,
        "SELECT * FROM Sessione WHERE id = ?",
        [sessionId]
    )

    if (!session) {
        locals.user = null;
        return next();
    }

    if (new Date(session.expiresAt) < new Date()) {
        await query(
            db,
            "DELETE FROM Session WHERE id = ?",
            [sessionId]
        );
        locals.user = null;
        return next();
    }

    const user = await query(
        db,
        "SELECT id, username, ruolo FROM Utente WHERE id = ?",
        [session.userId]
    )

    locals.user = user;
    return next();
}