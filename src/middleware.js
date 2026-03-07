import { db } from "./db/db_knex.js";

export async function onRequest({ cookies, locals }, next) {
    const sessionId = cookies.get("session")?.value;

    if (!sessionId) {
        locals.user = null;
        return next();
    }

    const session = await db("Sessione").select("*").where("id", sessionId).first();

    if (!session) {
        locals.user = null;
        return next();
    }

    if (new Date(session.expiresAt) < new Date()) {
        await db("Sessione").delete().where("id", sessionId);
        locals.user = null;
        return next();
    }

    const user = await db("Utente").select(["id", "username", "ruolo"]).where("id", session.userId).first();

    locals.user = user;
    return next();
}