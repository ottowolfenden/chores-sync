import { error, response } from "../../utils";

export const onRequest: PagesFunction<Env> = async ctx => {
    const guess = ctx.request.headers.get("Authorization");
    return guess && ctx.env.SECRET && guess == ctx.env.SECRET
        ? await ctx.next()
        : response(error(401, "unauthenticated"));
};
