import { neon } from "@neondatabase/serverless";

export const onRequestGet: PagesFunction<Env> = async context => {
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

export const onRequestPut: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const data = (await context.request.json()) as DbCount[];

        if (data.some(d => !d.is_offset))
            return Response.json({ error: "non-offset value passed" }, { status: 400 });
        if (data.some(d => typeof d.total != "number" || isNaN(d.total)))
            return Response.json({ error: "total not a number" }, { status: 400 });

        await sql`
            INSERT INTO assignments (assign_date, quantity, chore_id, member_id)
            SELECT '-infinity', input.total, c.chore_id, m.member_id
            FROM JSON_TO_RECORDSET(${JSON.stringify(data)}::json)
            AS input (chore_name TEXT, member_name TEXT, total INT)
            JOIN chores c ON c.chore_name = input.chore_name
            JOIN members m ON m.member_name = input.member_name
            ON CONFLICT (member_id, chore_id, assign_date)
            DO UPDATE SET quantity = EXCLUDED.quantity;
        `;
        return Response.json(null);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
