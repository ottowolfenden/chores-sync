import { neon } from "@neondatabase/serverless";

export const getAllChores = async (env: Env): Promise<DbChore[]> => {
    const sql = neon(env.DATABASE_URL);
    return (await sql`SELECT * FROM chores ORDER BY chore_name;`) as DbChore[];
};
