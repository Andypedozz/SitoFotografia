import { db } from "../../../db/db.js"
import { query } from "../../../db/db_utils.js"

// GET projects
export async function GET({ request }) {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    let result;
    let sql;

    try {
        if(slug) {
            sql = "SELECT * FROM Progetto WHERE slug = ?";
            result = query(db, sql, [slug]);
        } else {
            sql = "SELECT * FROM Progetto";
            result = query(db, sql);
        }
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

// POST project
export async function POST({ request }) {
    const data = await request.json();
    let result;
    try {
        const sql = "INSERT INTO Progetto (nome, descrizione, anno) VALUES (?, ?, ?, ?)";
        result = query(db, sql, [data]);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

// PUT project
export async function PUT({ request }) {
    // Return updated row/s
    const result = [];

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

// DLETE project
export async function DELETE({ request }) {
    let result;

    try {
        const data = await request.json();
        const sql = "DELETE FROM Progetto WHERE id = ?";
        result = query(db, sql, [data]);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}