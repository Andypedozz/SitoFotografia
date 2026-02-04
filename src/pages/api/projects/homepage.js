
import { Progetto } from "../../../db/models.js";

export async function GET({ request }) {
    const url = new URL(request.url);

    const result = await Progetto.findAll({ where: { homePage: 1 } });

    // TODO: Implement GET logic
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
}