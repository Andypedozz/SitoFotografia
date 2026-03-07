import bcrypt from "bcryptjs"
import { db } from "../../db/db_knex.js";

export async function POST({ request, redirect }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db("Utente").insert({ username, passwordHash });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/admin");
}