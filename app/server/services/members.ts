import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

export const getMember = async (env: Env, name: string): Promise<Result<DbMember>> => {
    try {
        const sql = neon(atob(env["DATABASE_URL"]));
        const members = (await sql`
            SELECT * FROM members
            WHERE member_name = ${name};
        `) as DbMember[];
        return members.length === 1 ? ok(members[0]) : error(404);
    } catch (err) {
        console.error(err);
        return error();
    }
};

export const getMembers = async (env: Env): Promise<Result<DbMember[]>> => {
    try {
        const sql = neon(atob(env["DATABASE_URL"]));
        return ok((await sql`SELECT * FROM members ORDER BY member_name;`) as DbMember[]);
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
                is_admin = ${member["is_admin"]},
                inactive_periods = ${member["inactive_periods"]},
                date_of_birth = ${member["date_of_birth"]},
                easter_egg_high_score = ${member["easter_egg_high_score"]}
            WHERE member_id = ${member["member_id"]}
            RETURNING member_id;
        `;
        return ids.length === 1 ? ok() : error(404);
    } catch (err) {
        console.error(err);
        return error();
    }
};
