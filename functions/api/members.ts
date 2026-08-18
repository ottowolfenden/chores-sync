import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        return Response.json(await sql`SELECT * FROM members ORDER BY member_name;`);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
