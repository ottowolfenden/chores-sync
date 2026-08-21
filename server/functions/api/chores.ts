import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";
import { test } from "../../services/test-service";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        console.log(test(context.env));
        return Response.json(await sql`SELECT * FROM chores ORDER BY chore_name;`);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
