import type { PagesFunction } from "@cloudflare/workers-types";

type Env = {
    DATABASE_URL: string;
    LOGIN_SECRET: string;
};

export const onRequest: PagesFunction<Env> = async context => {
    const guess = context.request.headers.get("X-Login-Secret");
    if (!guess || guess != context.env.LOGIN_SECRET)
        return Response.json({ error: "Incorrect login secret" }, { status: 401 });
    return Response.json({ message: "Correct login secret" });
};
