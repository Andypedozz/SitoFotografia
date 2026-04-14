import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { jsonResponse } from "../../scripts/responseUtils.js"
import { db } from "../../db/db.js";

export async function POST({ request, cookies, redirect }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    let user;
    try {
        user = (await db.execute("SELECT * FROM Utente WHERE username = ?", [username])).rows[0];
    } catch (error) {
        return jsonResponse({ error: error.message }, 500);
    }

    if (!user) {
        return redirect("/login?error=invalid");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
        return redirect("/login?error=invalid");
    }

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.execute("INSERT INTO Sessione (id, userId, expiresAt) VALUES (?, ?, ?)", [sessionId, user.id, expiresAt.toISOString()]);

    cookies.set("session", sessionId, {
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "lax",
        expires: expiresAt,
    });

    return redirect("/admin");
}