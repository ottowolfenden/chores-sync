import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        return Response.json(
            await sql`
                SELECT 
                    c.chore_name,
                    m.member_name,
                    o.is_offset,
                    coalesce(sum(a.quantity), 0) total
                FROM chores c
                CROSS JOIN members m
                CROSS JOIN (SELECT DISTINCT is_offset FROM assignments) o
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

export const onRequestPost: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);

        const data = (await context.request.json()) as {
            chore_name: string;
            member_name: string;
            is_offset: boolean;
            total: number;
        }[];

        if (data.some(d => !d.is_offset)) throw new Error("non-offset value passed");
        if (data.some(d => typeof d.total != "number" || isNaN(d.total)))
            throw new Error("total not a number");

        return Response.json(
            await sql`
                INSERT INTO assignments (
                    assign_timestamp,
                    quantity,
                    is_offset,
                    chore_id,
                    member_id
                )
                SELECT
                    '-infinity',
                    input.total,
                    true,
                    c.chore_id,
                    m.member_id
                FROM json_to_recordset(${JSON.stringify(data)}::json) AS input (
                    chore_name TEXT,
                    is_offset BOOLEAN,
                    member_name TEXT,
                    total INT
                )
                JOIN chores c on c.chore_name = input.chore_name
                JOIN members m on m.member_name = input.member_name
                ON CONFLICT (member_id, chore_id, assign_timestamp)
                DO UPDATE SET quantity = EXCLUDED.quantity;
            `
        );
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
