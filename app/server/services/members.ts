import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

export const getMembers = async (
    env: Env,
    name?: string | null
): Promise<Result<DbMember | DbMember[]>> => {
    try {
        const sql = neon(atob(env["DATABASE_URL"]));
        if (!name)
            return ok((await sql`SELECT * FROM members ORDER BY member_name;`) as DbMember[]);
        const result = (await sql`
            SELECT * FROM members
            WHERE member_name = ${name};
        `) as DbMember[];
        return result.length == 1 ? ok(result[0]) : error(404);
    } catch (err) {
        console.error(err);
        return error();
    }
};

export const setEasterEggHighScore = async (
    env: Env,
    { id, highScore }: { id: number | null; highScore: number | null }
): Promise<Result> => {
    try {
        if (id === null || highScore === null) return error(400);
        const sql = neon(atob(env["DATABASE_URL"]));
        const ids = await sql`
            UPDATE members
            SET easter_egg_high_score = ${highScore}
            WHERE member_id = ${id}
            RETURNING member_id;
        `;
        return ids.length == 0 ? error(404) : ok();
    } catch (err) {
        console.error(err);
        return error();
    }
};
