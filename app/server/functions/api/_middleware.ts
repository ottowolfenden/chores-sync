import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<Env> = async context => {
    const guess = context.request.headers.get("Authorization");
    if (!guess || guess != context.env.SECRET)
        return Response.json({ error: "unauthenticated" }, { status: 401 });
    return await context.next();
};
