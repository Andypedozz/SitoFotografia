
// GET homepage projects
export async function GET({ request }) {
    let result;
    try {
        const sql = "SELECT * FROM Progetto WHERE homepage = 1";
        result = query(db, sql);
    } catch (error) {
        result = error;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    })
}