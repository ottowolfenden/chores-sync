import { neon } from "@neondatabase/serverless";

export const getAllMembers = async (env: Env): Promise<DbMember[]> => {
    const sql = neon(env.DATABASE_URL);
    return (await sql`SELECT * FROM members ORDER BY member_name;`) as DbMember[];
};

export const getMember = async (env: Env, name: string): Promise<DbMember> => {
    const sql = neon(env.DATABASE_URL);
    const result =
        (await sql`SELECT * FROM members WHERE member_name = ${name};`) as DbMember[];
    if (!result[0] || result.length != 1) throw new Error(`${result.length} members found`);
    return result[0];
};
