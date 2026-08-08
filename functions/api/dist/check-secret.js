export const onRequest = async (context) => {
    const guess = context.request.headers.get("X-Login-Secret");
    if (!guess || guess != context.env.LOGIN_SECRET)
        return Response.json({ error: "Incorrect login secret" }, { status: 401 });
    return new Response(JSON.stringify({ message: "Correct login secret" }), {
        headers: { "Content-Type": "application/json" }
    });
};
//# sourceMappingURL=check-secret.js.map