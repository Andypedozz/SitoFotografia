import { checkApiPermission } from "../../../middleware/auth";
import { progettoService } from "../../../scripts/progettoService";

const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
};

const handleError = (error) => {
    console.error('API Error:', error);
    return jsonResponse({ 
        error: true, 
        message: error.message 
    }, 500);
};

// GET /api/projects?slug=xxx
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");

        const result = slug 
            ? await progettoService.getBySlug(slug)
            : await progettoService.getAll();

        return jsonResponse(result);

    } catch (error) {
        return handleError(error);
    }
}

// POST /api/projects
export async function POST({ request, locals }) {
    const permission = await checkApiPermission({ request, locals })

    if(!permission.allowed) {
        return jsonResponse({
            error: true,
            message: permission.error,
            status: permission.status
        }, permission.status);
    }

    try {
        const data = await request.json();
        console.log(data);
        
        if (!data.nome || !data.slug) {
            return jsonResponse({
                error: true,
                message: 'Nome e slug sono obbligatori'
            }, 400);
        }

        const newProject = await progettoService.create(data);
        
        return jsonResponse({
            success: true,
            data: newProject
        }, 201);

    } catch (error) {
        return handleError(error);
    }
}

// PUT /api/projects
export async function PUT({ request, locals }) {
    const permission = await checkApiPermission({ request, locals })

    if(!permission.allowed) {
        return jsonResponse({
            error: true,
            message: permission.error,
            status: permission.status
        }, permission.status);
    }

    try {
        const { id, ...data } = await request.json();
        console.log({ id, data });

        if (!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        const updatedProject = await progettoService.update(id, data);

        if (!updatedProject) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            data: updatedProject
        });

    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/projects
export async function DELETE({ request, locals }) {
    const permission = await checkApiPermission({ request, locals })

    if(!permission.allowed) {
        return jsonResponse({
            error: true,
            message: permission.error,
            status: permission.status
        }, permission.status);
    }

    try {
        const { id } = await request.json();
        console.log(id);

        if (!id) {
            return jsonResponse({
                error: true,
                message: 'ID progetto obbligatorio'
            }, 400);
        }

        const deleted = await progettoService.delete(id);

        if (!deleted) {
            return jsonResponse({
                error: true,
                message: 'Progetto non trovato'
            }, 404);
        }

        return jsonResponse({
            success: true,
            message: 'Progetto eliminato con successo'
        });

    } catch (error) {
        return handleError(error);
    }
}