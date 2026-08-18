import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const name = new URL(context.request.url).searchParams.get("name");
        if (name) {
            const result = await sql`SELECT * FROM members WHERE member_name = ${name};`;
            if (result.length != 1) return Response.json(null, { status: 404 });
            return Response.json(result[0]);
        }
        return Response.json(await sql`SELECT * FROM members ORDER BY member_name;`);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
