import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        return Response.json(await sql`SELECT * FROM chores;`);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
