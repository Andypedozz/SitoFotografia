import { handleError, jsonResponse } from "../../../scripts/responseUtils.js";
import { Media } from "../../../services/media.js";

export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const projectSlug = url.searchParams.get("slug");

        const result = projectSlug
            ? Media.getByProjectSlug(projectSlug) : id
            ? Media.getById(id)
            : Media.getAll();
            
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST({ request }) {
    try {
        const data = await request.json();
        const result = Media.create(data);
        return jsonResponse(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function PUT({ request }) {

}

export async function DELETE({ request }) {
    try {
        const { id } = await request.json();
        const result = Media.delete(id);
        return jsonResponse(result);
    } catch (error) {

    }
}