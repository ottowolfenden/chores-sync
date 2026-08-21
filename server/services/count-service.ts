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
