import bcrypt from "bcryptjs"
import { query } from "../../db/db_utils.js"
import { db } from "../../db/db.js";

export async function POST({ request }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const passwordHash = await bcrypt.hash(password, 10);

  await query(db,
    "INSERT INTO Utente (username, passwordHash) VALUES (?, ?)",
    [username, passwordHash]
  );

  return new Response(JSON.stringify({ ok: true }));
}