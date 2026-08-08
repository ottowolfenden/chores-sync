export async function onRequestGet(context) {
    return new Response(JSON.stringify({ message: "test" }), {
        headers: { "Content-Type": "application/json" }
    });
}
