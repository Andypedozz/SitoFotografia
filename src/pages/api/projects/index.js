import { Progetto } from "../../../lib/db.js";

/**
 * Handle GET requests for projects.
 */

export async function GET({ request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const nome = url.searchParams.get("nome");

    let result;

    try {
        if (id) {
            result = await Progetto.findByPk(id);
        } else if (nome) {
            result = await Progetto.findOne({ where: { nome } });
        } else {
            result = await Progetto.findAll();
        }
    
        // TODO: Implement GET logic
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch(err) {
        console.error(err.message);
        return new Response(JSON.stringify(err.message), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle POST requests to create a new project.
*/
export async function POST({ request }) {
    const body = await request.json();
    const nuovoProgetto = await Progetto.create({
        nome: body.nome,
        descrizione: body.descrizione,
        anno: body.anno
    });
    return new Response(JSON.stringify(nuovoProgetto), {
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Handle PUT requests to update an existing project.
*/
export async function PUT({ request }) {
    const body = await request.json();
    const progetto = await Progetto.findByPk(body.id);
    if (progetto) {
        progetto.nome = body.nome || progetto.nome;
        progetto.descrizione = body.descrizione || progetto.descrizione;
        progetto.anno = body.anno || progetto.anno;
        await progetto.save();
        return new Response(JSON.stringify(progetto), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ error: "Progetto non trovato" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle DELETE requests to remove a project.
*/
export async function DELETE({ request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const progetto = await Progetto.findByPk(id);
    if (progetto) {
        await progetto.destroy();
        return new Response(JSON.stringify({ message: "Progetto eliminato con successo" }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ error: "Progetto non trovato" }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}