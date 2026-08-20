import { neon } from "@neondatabase/serverless";
import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const sql = neon(context.env.DATABASE_URL);
        const [date, minDate, maxDate] = ["date", "min-date", "max-date"].map(p =>
            new URL(context.request.url).searchParams.get(p)
        );
        const invalidParams =
            [date, minDate, maxDate].some(
                d => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d)))
            ) ||
            (minDate && maxDate && Date.parse(minDate) > Date.parse(maxDate));

        let data;
        let status: number | undefined;

        if (!date && !minDate && !maxDate) [data, status] = [{ error: "no parameters" }, 400];
        else if (invalidParams) [data, status] = [{ error: "invalid format" }, 400];
        else if (date) data = await sql`SELECT * FROM assignments WHERE assign_date = ${date}`;
        else if (minDate && maxDate)
            data = await sql`
                SELECT * FROM assignments 
                WHERE assign_date >= ${minDate} AND assign_date <= ${maxDate}
            `;
        else if (minDate)
            data = await sql`SELECT * FROM assignments WHERE assign_date >= ${minDate}`;
        else if (maxDate)
            data = await sql`
                SELECT * FROM assignments 
                WHERE assign_date > '-infinity' AND assign_date <= ${maxDate}
            `;
        else [data, status] = [null, 400];

        return Response.json(data, { status: status ?? 200 });
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
