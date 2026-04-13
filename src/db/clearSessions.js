import dotenv from "dotenv"
import { db } from "./db_knex.js";

dotenv.config();

async function clearSessions() {
    const sessioneExists = await db.schema.hasTable("Sessione");
    if(sessioneExists) {
        await db("Sessione").delete();
    }
}

clearSessions();