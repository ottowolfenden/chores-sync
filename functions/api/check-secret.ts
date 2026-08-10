import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<{ LOGIN_SECRET: string }> = (async context => {
    const guess = context.request.headers.get("X-Login-Secret");
    if (!guess || guess != context.env.LOGIN_SECRET)
        return Response.json({ error: "Incorrect login secret" }, { status: 401 });
    return Response.json({ message: "Correct login secret" });
}) satisfies PagesFunction<{ LOGIN_SECRET: string }>;
