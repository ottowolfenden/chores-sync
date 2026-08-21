import { neon } from "@neondatabase/serverless";

export const getCounts = async (env: Env): Promise<DbCount[]> => {
    const sql = neon(env.DATABASE_URL);
    return (await sql`
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
    `) as DbCount[];
};

export const setCounts = async (env: Env, counts: DbCount[]): Promise<void> => {
    const sql = neon(env.DATABASE_URL);
    await sql`
        INSERT INTO assignments (
            assign_date,
            quantity,
            chore_id,
            member_id
        )
        SELECT
            '-infinity',
            input.total,
            c.chore_id,
            m.member_id
        FROM json_to_recordset(${JSON.stringify(counts)}::json) AS input (
            chore_name TEXT,
            member_name TEXT,
            total INT
        )
        JOIN chores c on c.chore_name = input.chore_name
        JOIN members m on m.member_name = input.member_name
        ON CONFLICT (member_id, chore_id, assign_date)
        DO UPDATE SET quantity = EXCLUDED.quantity;
    `;
};
