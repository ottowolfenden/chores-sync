import { getCounts, setCounts } from "../../services/count-service";

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
        const data = (await context.request.json()) as DbCount[];

        if (data.some(d => !d.is_offset)) throw new Error("non-offset value passed");
        if (data.some(d => typeof d.total != "number" || isNaN(d.total)))
            throw new Error("total not a number");

        await setCounts(context.env, data);
        return Response.json(null, { status: 200 });
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
