import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

export const getMembers = async (
    env: Env,
    name?: string | null
): Promise<Result<DbMember | DbMember[]>> => {
    try {
        const sql = neon(atob(env.DATABASE_URL));
        if (name) {
            const result = (await sql`
                SELECT * FROM members
                WHERE member_name = ${name};
            `) as DbMember[];
            return result.length == 1 ? ok(result[0]) : error(404);
        }
        return ok((await sql`SELECT * FROM members ORDER BY member_name;`) as DbMember[]);
    } catch (err) {
        console.error(err);
        return error();
    }
};
