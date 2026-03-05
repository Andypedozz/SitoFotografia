import { v4 as uuidv4 } from "uuid";
import { query, queryAsync } from "../../db/db_utils";
import bcrypt from "bcryptjs";
import { db } from "../../db/db";

export async function POST({ request, cookies, redirect }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    const data = query(db, "SELECT * FROM Utente WHERE username = ?", [username]);
    const user = data[0];

    if (!user) {
        return new Response("Credenziali non valide", { status: 401 });
    }

    const valid = bcrypt.compare(password, user.passwordHash);

    if (!valid) {
        return new Response("Credenziali non valide", { status: 401 });
    }

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    query(
        db,
        "INSERT INTO Sessione (id, userId, expiresAt) VALUES (?, ?, ?)",
        [sessionId, user.id, expiresAt.toISOString()]
    );

    cookies.set("session", sessionId, {
        httpOnly: true,
        path: "/",
        // secure: true,
        sameSite: "lax",
        expires: expiresAt,
    });

    return redirect("/admin");
}