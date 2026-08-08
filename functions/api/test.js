export async function onRequest(context) {
    const guess = context.request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!guess || guess != context.env["login-secret"])
        return Response.json({ error: "Unauthorised" }, { status: 401 });

    return new Response(JSON.stringify({ message: "authorised" }), {
        headers: { "Content-Type": "application/json" }
    });
}
