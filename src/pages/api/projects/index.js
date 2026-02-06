import { db } from "../../../db/db.js"
import { query } from "../../../db/db_utils.js"

export async function GET({ request }) {
    let result;
    try {
        const sql = "SELECT * FROM Progetto";
        result = query(db, sql);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

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

export async function PUT({ request }) {
    const result = []

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function DELETE({ request }) {
    const result = []

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}