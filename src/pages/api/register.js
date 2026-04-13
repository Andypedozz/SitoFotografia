import bcrypt from "bcryptjs"
import { db } from "../../db/db.js";

export async function POST({ request, redirect }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const ruolo = "admin";

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.execute("INSERT INTO Utente (username, passwordHash, ruolo) VALUES (?, ?, ?)", [username, passwordHash, ruolo]);
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/admin");
}