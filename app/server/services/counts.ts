import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

export const getAllCounts = async (env: Env): Promise<Result<DbCount[]>> => {
    try {
        const sql = neon(env.DATABASE_URL);
        return ok(
            (await sql`
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
            `) as DbCount[]
        );
    } catch (err) {
        console.error(err);
        return error();
    }
};

export const changeCounts = async (env: Env, counts: DbCount[]): Promise<Result> => {
    try {
        const sql = neon(env.DATABASE_URL);

        if (counts.some(d => !d.is_offset)) return error(400, "non-offset value passed");
        if (counts.some(d => typeof d.total != "number" || isNaN(d.total)))
            return error(400, "total not a number");

        await sql`
            INSERT INTO assignments (assign_date, quantity, chore_id, member_id)
            SELECT '-infinity', input.total, c.chore_id, m.member_id
            FROM JSON_TO_RECORDSET(${JSON.stringify(counts)}::json)
            AS input (chore_name TEXT, member_name TEXT, total INT)
            JOIN chores c ON c.chore_name = input.chore_name
            JOIN members m ON m.member_name = input.member_name
            ON CONFLICT (member_id, chore_id, assign_date)
            DO UPDATE SET quantity = EXCLUDED.quantity;
        `;

        return ok();
    } catch (err) {
        console.error(err);
        return error();
    }
};
