import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<Env> = async context => {
    const guess = context.request.headers.get("X-Login-Secret");
    if (!guess || guess != context.env.LOGIN_SECRET)
        return Response.json({ error: "unauthenticated" }, { status: 401 });
    return await context.next();
};
