import { neon } from "@neondatabase/serverless";
import { ok, error } from "../utils";

const validateDate = (date: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));

export const getAssignments = async (
    env: Env,
    date: string | null,
    minDate: string | null,
    maxDate: string | null
): Promise<Result<DbAssignment[]>> => {
    try {
        const sql = neon(env.DATABASE_URL);

        if (
            [date, minDate, maxDate].some(d => d && !validateDate(d)) ||
            (minDate && maxDate && Date.parse(minDate) > Date.parse(maxDate)) ||
            (!date && !minDate && !maxDate) ||
            (date && (minDate || maxDate))
        )
            return error(400);

        return ok(
            (date
                ? await sql`
                    SELECT * FROM assignments a
                    JOIN chores c ON c.chore_id = a.chore_id
                    JOIN members m ON m.member_id = a.member_id
                    WHERE a.assign_date = ${date}
                    ORDER BY c.chore_name, m.member_name;
                `
                : await sql`
                    SELECT * FROM assignments a
                    JOIN chores c ON c.chore_id = a.chore_id
                    JOIN members m ON m.member_id = a.member_id
                    WHERE a.assign_date >= ${minDate ?? "-infinity"}
                    AND a.assign_date <= ${maxDate ?? "infinity"}
                    AND a.assign_date > '-infinity'
                    ORDER BY c.chore_name, m.member_name;
                `) as DbAssignment[]
        );
    } catch (err) {
        console.error(err);
        return error();
    }
};

export const addAssignment = async (env: Env, assignment: DbAssignment): Promise<Result> => {
    try {
        const sql = neon(env.DATABASE_URL);

        await sql`
            INSERT INTO assignments (
                assignment_uuid,
                assign_date,
                quantity,
                chore_id,
                member_id
            )
            VALUES (
                ${assignment.assignment_uuid},
                ${assignment.assign_date},
                ${assignment.quantity},
                ${assignment.chore_id},
                ${assignment.member_id}
            )
            ON CONFLICT (member_id, chore_id, assign_date)
            DO UPDATE SET quantity = assignments.quantity + EXCLUDED.quantity;
        `;

        return ok();
    } catch (err) {
        console.error(err);
        return error();
    }
};

export const replaceAssignments = async (
    env: Env,
    assignments: DbAssignment[],
    date: string | null
): Promise<Result> => {
    try {
        const sql = neon(env.DATABASE_URL);

        if (!date || !validateDate(date)) return error(400, "date invalid");

        const map = new Map();
        assignments.forEach(a => {
            const key = `${a.member_id}-${a.chore_id}-${a.assign_date}`;
            if (map.has(key)) map.get(key).quantity += a.quantity;
            else map.set(key, { ...a });
        });
        const summedAssignments = [...map.values()];
        const uuids = summedAssignments.map(a => a.assignment_uuid);

        await sql.transaction([
            uuids.length == 0
                ? sql`DELETE FROM assignments WHERE assign_date = ${date};`
                : sql`
                    DELETE FROM assignments
                    WHERE assign_date = ${date}
                    AND NOT (assignment_uuid = ANY(${uuids}));
                `,
            sql`
                INSERT INTO assignments (
                    assignment_uuid,
                    assign_date,
                    quantity,
                    chore_id,
                    member_id
                )
                SELECT input.*
                FROM JSON_TO_RECORDSET(${JSON.stringify(summedAssignments)}::json)
                AS input (
                    assignment_uuid UUID,
                    assign_date DATE,
                    quantity INT,
                    chore_id INT,
                    member_id INT
                )
                ON CONFLICT (assignment_uuid)
                DO UPDATE SET
                    assign_date = EXCLUDED.assign_date,
                    quantity = EXCLUDED.quantity,
                    chore_id = EXCLUDED.chore_id,
                    member_id = EXCLUDED.member_id;
            `
        ]);

        return ok();
    } catch (err) {
        console.error(err);
        return error();
    }
};
