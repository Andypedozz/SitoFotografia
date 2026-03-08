import dotenv from "dotenv";
import { db } from "./db_knex.js";
import fs from "node:fs";

dotenv.config();

const IMAGES_PATH = process.env.IMAGES_PATH;

async function createDatabase() {
    
    const utenteExists = await db.schema.hasTable("Utente");
    const progettoExists = await db.schema.hasTable("Progetto");
    const mediaExists = await db.schema.hasTable("Media");
    const sessioneExists = await db.schema.hasTable("Sessione");

    // Creazione della tabella Utente
    if(!utenteExists) {
        await db.schema.createTable("Utente", table => {
            table.increments("id").primary().notNullable();
            table.string("username").notNullable().unique();
            table.string("passwordHash").notNullable();
            table.string("ruolo").notNullable().defaultTo("user").checkIn(["user", "admin"]);
            table.timestamp("lastLogin").notNullable().defaultTo(db.fn.now());
            table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
            table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
        })
    }

    // Creazione della tabella Progetto
    if(!progettoExists) {
        await db.schema.createTable('Progetto', (table) => {
            table.increments('id').primary().notNullable();
            table.string('nome').notNullable().unique();
            table.string('slug').notNullable().unique();
            table.string('copertina').notNullable();
            table.integer("homepage").notNullable().defaultTo(0);
            table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
            table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
        });
    }

    // Creazione della tabella Media
    if(!mediaExists) {
        await db.schema.createTable("Media", table => {
            table.increments("id").primary().notNullable();
            table.string("percorso").notNullable();
            table.string("nome").notNullable();
            table.string("tipo").notNullable();
            table.integer("idProgetto").references("id").inTable("Progetto");
            table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
            table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
        })

    }

    // Creazione della tabella Sessione
    if(!sessioneExists) {
        await db.schema.createTable("Sessione", table => {
            table.uuid("id").primary().notNullable();
            table.timestamp("expiresAt").notNullable();
            table.integer("userId").references("id").inTable("Utente");
            table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
            table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
        })
    }
}

async function insertStandardData() {
    const projects = await db("Progetto").select("*");
    if(projects.length > 0) return;

    await db("Progetto").insert([
        { nome: "Opia", slug: "opia", copertina: "opia.jpg" },
        { nome: "Pizzeria Roby's", slug: "robys", copertina: "robys.jpg" },
        { nome: "Supermoto", slug: "supermoto", copertina: "supermoto.jpg" },
        { nome: "Enoteca Montevecchio", slug: "enoteca", copertina: "enoteca.jpg" },
        { nome: "Moda", slug: "moda", copertina: "moda.jpg" }
    ])

    await db("Utente").insert({
        id: 1,
        username: "admin",
        passwordHash: "$2b$10$3X.ruD82rX4d4oMiFNgdTOHBn0Ea7Q4Kw0B/vWiiEQ6SsMaU1.weO",
        ruolo: "admin"
    })
}

async function fillMediaTable() {
    
    // Controllo se la tabella Media è vuota
    const medias = await db("Media").select("*");
    if (medias.length > 0) return;

    const files = fs.readdirSync("./public/"+IMAGES_PATH);
    files.forEach(async file => {
        const media = { percorso: IMAGES_PATH+"/"+file, nome: file, tipo: "image" };
        console.log(media)
        await db("Media").insert(media);
    })
}

async function main() {
    await createDatabase();
    await insertStandardData();
    await fillMediaTable();
}

main();