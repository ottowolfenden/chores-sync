import { neon } from "@neondatabase/serverless";
import { getCounts } from "../../services/count-service";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        return Response.json(await getCounts(context.env));
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);

        const data = (await context.request.json()) as {
            chore_name: string;
            member_name: string;
            is_offset: boolean;
            total: number;
        }[];

        if (data.some(d => !d.is_offset)) throw new Error("non-offset value passed");
        if (data.some(d => typeof d.total != "number" || isNaN(d.total)))
            throw new Error("total not a number");

        return Response.json(
            await sql`
                INSERT INTO assignments (
                    assign_date,
                    quantity,
                    chore_id,
                    member_id
                )
                SELECT
                    '-infinity',
                    input.total,
                    c.chore_id,
                    m.member_id
                FROM json_to_recordset(${JSON.stringify(data)}::json) AS input (
                    chore_name TEXT,
                    member_name TEXT,
                    total INT
                )
                JOIN chores c on c.chore_name = input.chore_name
                JOIN members m on m.member_name = input.member_name
                ON CONFLICT (member_id, chore_id, assign_date)
                DO UPDATE SET quantity = EXCLUDED.quantity;
            `
        );
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
