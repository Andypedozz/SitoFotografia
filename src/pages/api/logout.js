import { db } from "../../db/db.js";

export async function POST({ cookies, redirect }) {
    const sessionId = cookies.get("session")?.value;

    if (sessionId) {
        await db.execute("DELETE FROM Sessione WHERE id = ?", [sessionId]);
    }

    cookies.delete("session", { path: "/" });

    return redirect("/");
}