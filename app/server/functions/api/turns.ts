import { neon } from "@neondatabase/serverless";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const turnData = (await sql`
                SELECT 
                    c.chore_id,
                    m.member_id,
                    COALESCE(SUM(a.quantity), 0) total,
                    COALESCE(MAX(a.assign_date), '-infinity') last_assign_date
                FROM chores c
                CROSS JOIN members m
                LEFT JOIN assignments a
                    ON a.chore_id = c.chore_id
                    AND a.member_id = m.member_id
                    AND a.assign_date < CURRENT_DATE
                GROUP BY c.chore_id, m.member_id
                ORDER BY c.chore_id;
            `) as DbTurnData[];

        if (turnData.length == 0) return Response.json([]);

        const choreIds = [...new Set(turnData.map(td => td.chore_id))];
        const toNum = (date: number | Date) =>
            date instanceof Date ? date.getTime() : -Infinity;

        const turns: DbTurn[] = choreIds.map(cId => {
            let possible = turnData.filter(td => td.chore_id == cId);

            const minTotal = Math.min(...possible.map(p => p.total));
            possible = possible.filter(p => p.total == minTotal);
            if (possible.length == 1 && possible[0])
                return { chore_id: cId, member_id: possible[0].member_id };

            const oldestTimestamp = Math.min(...possible.map(p => toNum(p.last_assign_date)));
            possible = possible.filter(p => toNum(p.last_assign_date) == oldestTimestamp);
            if (possible[0]) return { chore_id: cId, member_id: possible[0].member_id };
            else throw new Error("failed to determine turn");
        });

        return Response.json(turns);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
