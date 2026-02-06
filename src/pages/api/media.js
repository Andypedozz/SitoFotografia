

export async function GET({ request }) {
    const result = []
    
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST({ request }) {
    const result = []

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