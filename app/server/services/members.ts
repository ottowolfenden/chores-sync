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

export const updateMember = async (env: Env, member: DbMember): Promise<Result> => {
    try {
        const sql = neon(atob(env["DATABASE_URL"]));
        const ids = await sql`
            UPDATE members
            SET
                member_name = ${member["member_name"]},
                is_active = ${member["is_active"]},
                is_admin = ${member["is_admin"]},
                date_of_birth = ${member["date_of_birth"]},
                easter_egg_high_score = ${member["easter_egg_high_score"]}
            WHERE member_id = ${member["member_id"]}
            RETURNING member_id;
        `;
        return ids.length == 0 ? error(404) : ok();
    } catch (err) {
        console.error(err);
        return error();
    }
};
