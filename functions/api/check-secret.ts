import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<Env> = async () =>
    Response.json({ message: "authenticated" });
