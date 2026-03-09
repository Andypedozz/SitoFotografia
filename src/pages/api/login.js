import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db } from "../../db/db_knex";
import { jsonResponse } from "../../scripts/responseUtils.js"

export async function POST({ request, cookies, redirect }) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");

    let user;
    try {
        user = await db("Utente").select("*").where("username", username).first();
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

    await db("Sessione").insert({
        id: sessionId,
        userId: user.id,
        expiresAt: expiresAt.toISOString()
    });

    cookies.set("session", sessionId, {
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "lax",
        expires: expiresAt,
    });

    return redirect("/admin");
}