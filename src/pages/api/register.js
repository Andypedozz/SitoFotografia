import bcrypt from "bcryptjs"
import { query, queryAsync } from "../../db/db_utils.js"
import { db } from "../../db/db.js";

export async function POST({ request, redirect }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await queryAsync(db,
      "INSERT INTO Utente (username, passwordHash) VALUES (?, ?)",
      [username, passwordHash]
    );
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/admin");
}