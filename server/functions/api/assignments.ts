import { getAssignments } from "../../services/assignments-service";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const [date, minDate, maxDate] = ["date", "min-date", "max-date"].map(p =>
            new URL(context.request.url).searchParams.get(p)
        );

        if (
            [date, minDate, maxDate].some(
                d => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d)))
            ) ||
            (minDate && maxDate && Date.parse(minDate) > Date.parse(maxDate)) ||
            (date && (minDate || maxDate))
        )
            return Response.json({ error: "invalid format" }, { status: 400 });
        else if (!date && !minDate && !maxDate)
            return Response.json({ error: "no parameters" }, { status: 400 });
        else if (date) return Response.json(await getAssignments(context.env, { date }));
        else if (minDate && maxDate)
            return Response.json(await getAssignments(context.env, { minDate, maxDate }));
        return Response.json(null, { status: 500 });
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
