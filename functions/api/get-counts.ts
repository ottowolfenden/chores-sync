import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        return Response.json(
            await sql`
                SELECT 
                    c.chore_name,
                    m.member_name,
                    o.is_offset,
                    COALESCE(SUM(a.quantity), 0) total
                FROM chores c
                CROSS JOIN members m
                CROSS JOIN (SELECT is_offset FROM assignments) o
                LEFT JOIN assignments a
                    ON a.chore_id = c.chore_id
                    AND a.member_id = m.member_id
                    AND a.is_offset = o.is_offset
                GROUP BY c.chore_name, m.member_name, o.is_offset
                ORDER BY c.chore_name, m.member_name, o.is_offset;
            `
        );
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
