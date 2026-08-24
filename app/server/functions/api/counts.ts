import { error, response } from "../../utils";
import { changeCounts, getAllCounts } from "../../services/counts";

export const onRequestGet: PagesFunction<Env> = async ctx =>
    response(await getAllCounts(ctx.env));

export const onRequestPut: PagesFunction<Env> = async ctx => {
    const data = (await ctx.request.json().catch(() => null)) as DbCount[] | null;
    if (!data) return response(error(400, "no counts provided"));
    return response(await changeCounts(ctx.env, data));
};
