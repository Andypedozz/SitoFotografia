import dotenv from "dotenv";
import { db } from "./db_knex";
import fs from "node:fs";

dotenv.config();

const IMAGES_PATH = process.env.IMAGES_PATH;

async function createDatabase() {
    
    // Creazione della tabella Utente
    await db.schema.createTableIfNotExists("Utente", table => {
        table.increments("id").primary().notNullable();
        table.string("username").notNullable().unique();
        table.string("passwordHash").notNullable();
        table.string("ruolo").notNullable().defaultTo("user").checkIn(["user", "admin"]);
        table.timestamp("lastLogin").notNullable();
        table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
        table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
    })

    // Creazione della tabella Progetto
    await db.schema.createTableIfNotExists('Progetto', (table) => {
        table.increments('id').primary().notNullable();
        table.string('nome').notNullable().unique();
        table.string('slug').notNullable().unique();
        table.string('copertina').notNullable();
        table.integer("homepage").notNullable().defaultTo(0);
        table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
        table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
    });
    
    // Creazione della tabella Media
    await db.schema.createTableIfNotExists("Media", table => {
        table.increments("id").primary().notNullable();
        table.string("percorso").notNullable();
        table.string("nome").notNullable();
        table.string("tipo").notNullable();
        table.foreign("idProgetto").references("id").inTable("Progetto");
        table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
        table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
    })
    
    // Creazione della tabella Sessione
    await db.schema.createTableIfNotExists("Sessione", table => {
        table.increments("id").primary().notNullable();
        table.timestamp("expiresAt").notNullable();
        table.foreign("userId").references("id").inTable("Utente");
        table.timestamp("createdAt").notNullable().defaultTo(db.fn.now());
        table.timestamp("updatedAt").notNullable().defaultTo(db.fn.now());
    })
}

async function fillMediaTable() {
    
    // Controllo se la tabella Media è vuota
    const medias = await db("Media").select("*");
    const isMediaEmpty = medias.length === 0;

    // Carica le immagini
    if(isMediaEmpty) {

        // Elimina tutte le immagini
        await db("Media").clear();
        const files = fs.readdirSync(IMAGES_PATH);
        files.forEach(async file => {
            const media = { percorso: IMAGES_PATH+"/"+file, nome: file, tipo: "image" };
            await db("Media").insert(media);
        })
    }
}

createDatabase();
fillMediaTable();