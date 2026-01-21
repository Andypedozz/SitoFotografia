import { Media } from "../../lib/db.js";
/**
 * Handle GET requests for media.
 */
export async function GET({ request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const nome = url.searchParams.get("nome");

    let result;

    try {
        if (id) {
            result = await Media.findByPk(id);
        } else if (nome) {
            result = await Media.findOne({ where: { nome } });
        } else {
            result = await Media.findAll();
        }

        // TODO: Implement GET logic
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error(err.message);
        return new Response(JSON.stringify(err.message), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle POST requests to upload new media.
 */
export async function POST({ request }) {

}

/**
 * Handle DELETE requests to remove media.
 */
export async function DELETE({ request }) {

}