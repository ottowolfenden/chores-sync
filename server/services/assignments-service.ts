import { neon } from "@neondatabase/serverless";

export const getAssignments = async (
    env: Env,
    opts: { date?: string; maxDate?: string; minDate?: string }
): Promise<DbAssignment[]> => {
    const sql = neon(env.DATABASE_URL);
    return (
        opts.date
            ? await sql`SELECT * FROM assignments WHERE assign_date = ${opts.date}`
            : await sql`
                SELECT * FROM assignments 
                WHERE
                    assign_date > -infinity
                    AND assign_date >= ${opts.minDate}
                    AND assign_date <= ${opts.maxDate ?? "infinity"}
            `
    ) as DbAssignment[];
};
