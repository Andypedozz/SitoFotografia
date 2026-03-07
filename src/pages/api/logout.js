import { db } from "../../db/db_knex.js";

export async function POST({ cookies, redirect }) {
    const sessionId = cookies.get("session")?.value;

    if (sessionId) {
        await db("Sessione").delete().where("id", sessionId);
    }

    cookies.delete("session", { path: "/" });

    return redirect("/");
}