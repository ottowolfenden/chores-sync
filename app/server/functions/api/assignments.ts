import { neon } from "@neondatabase/serverless";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const [date, minDate, maxDate] = ["date", "min-date", "max-date"].map(p =>
            new URL(context.request.url).searchParams.get(p)
        );

        if (
            [date, minDate, maxDate].some(
                d => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d)))
            ) ||
            (minDate && maxDate && Date.parse(minDate) > Date.parse(maxDate)) ||
            (!date && !minDate && !maxDate) ||
            (date && (minDate || maxDate))
        )
            return Response.json(null, { status: 400 });

        return Response.json(
            await (() => {
                if (date) return sql`SELECT * FROM assignments WHERE assign_date = ${date};`;
                else if (minDate && maxDate)
                    return sql`
                        SELECT * FROM assignments 
                        WHERE assign_date >= ${minDate} AND assign_date <= ${maxDate};
                    `;
                return sql`
                    SELECT * FROM assignments 
                    WHERE assign_date >= ${minDate ?? "-infinity"}
                    AND assign_date <= ${maxDate ?? "infinity"}
                    AND assign_date > '-infinity';
                `;
            })()
        );
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
