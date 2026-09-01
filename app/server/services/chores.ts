import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

export const getAllChores = async (env: Env): Promise<Result<DbChore[]>> => {
    try {
        const sql = neon(atob(env.DATABASE_URL));
        return ok((await sql`SELECT * FROM chores ORDER BY chore_name;`) as DbChore[]);
    } catch (err) {
        console.error(err);
        return error();
    }
};
