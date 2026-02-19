import { db } from "../../../db/db.js"
import { query } from "../../../db/db_utils.js"

export async function GET({ request }) {
    let result;

    try {
        const sql = "SELECT * FROM Media;";
        result = query(db, sql);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST({ request }) {
    let result;
    try {
        const data = await request.json();
        const sql = "INSERT INTO Media (nome, percorso, tipo, idProgetto) VALUES (?, ?, ?, ?)";
        result = query(db, sql, Object.values(data));
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function PUT({ request }) {
    let result;

    try {
        const data = await request.json();
        const sql = "UPDATE Media SET nome = ?, percorso = ?, tipo = ?, idProgetto = ? WHERE id = ?";
        result = query(db, sql, Object.values(data));
    } catch (error) {
        result = error;
    }
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function DELETE({ request }) {
    let result;
    try {
        const data = await request.json();
        const sql = "DELETE FROM Media WHERE id = ?";
        result = query(db, sql, Object.values(data));
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}