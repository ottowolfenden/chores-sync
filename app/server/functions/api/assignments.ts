import { neon } from "@neondatabase/serverless";

const validateDate = (date: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const [date, minDate, maxDate] = ["date", "min-date", "max-date"].map(p =>
            new URL(context.request.url).searchParams.get(p)
        );

        if (
            [date, minDate, maxDate].some(d => d && !validateDate(d)) ||
            (minDate && maxDate && Date.parse(minDate) > Date.parse(maxDate)) ||
            (!date && !minDate && !maxDate) ||
            (date && (minDate || maxDate))
        )
            return Response.json(null, { status: 400 });

        return Response.json(
            await (() => {
                if (date)
                    return sql`
                        SELECT * FROM assignments a
                        JOIN chores c ON c.chore_id = a.chore_id
                        WHERE a.assign_date = ${date}
                        ORDER BY c.chore_name;
                    `;
                else if (minDate && maxDate)
                    return sql`
                        SELECT * FROM assignments a
                        JOIN chores c ON c.chore_id = a.chore_id
                        WHERE a.assign_date >= ${minDate} AND a.assign_date <= ${maxDate}
                        ORDER BY c.chore_name;
                    `;
                return sql`
                    SELECT * FROM assignments a
                    JOIN chores c on c.chore_id = a.chore_id
                    WHERE a.assign_date >= ${minDate ?? "-infinity"}
                    AND a.assign_date <= ${maxDate ?? "infinity"}
                    AND a.assign_date > '-infinity'
                    ORDER BY c.chore_name;
                `;
            })()
        );
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const data = (await context.request.json()) as DbAssignment | DbAssignment[];
        const params = new URL(context.request.url).searchParams;

        switch (params.get("action")) {
            case "add":
                if (Array.isArray(data))
                    return Response.json(
                        { error: "multiple objects not allowed" },
                        { status: 400 }
                    );
                await sql`
                    INSERT INTO assignments (
                        assignment_uuid,
                        assign_date,
                        quantity,
                        chore_id,
                        member_id
                    )
                    VALUES (
                        ${data.assignment_uuid},
                        ${data.assign_date},
                        ${data.quantity},
                        ${data.chore_id},
                        ${data.member_id}
                    )
                    ON CONFLICT (member_id, chore_id, assign_date)
                    DO UPDATE SET quantity = assignments.quantity + EXCLUDED.quantity;
                `;
                break;
            case "replace":
                const date = params.get("date");
                if (!date || !validateDate(date))
                    return Response.json({ error: "date invalid" }, { status: 400 });
                break;
            default:
                return Response.json({ error: "invalid action" }, { status: 400 });
        }
        return Response.json(null);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
