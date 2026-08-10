import { PagesFunction, Response as CFResponse } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<{ LOGIN_SECRET: string }> = async context => {
    const guess = context.request.headers.get("X-Login-Secret");
    if (!guess || guess != context.env.LOGIN_SECRET)
        return CFResponse.json({ error: "Incorrect login secret" }, { status: 401 });
    return new CFResponse(JSON.stringify({ message: "Correct login secret" }), {
        headers: { "Content-Type": "application/json" }
    });
};
