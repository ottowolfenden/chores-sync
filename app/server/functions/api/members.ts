import { getMember, getMembers, updateMember } from "../../services/members";
import { error, response } from "../../utils";

export const onRequestGet: PagesFunction<Env> = async ctx => {
    const name = new URL(ctx.request.url).searchParams.get("name");
    if (name) return response(await getMember(ctx.env, name));
    return response(await getMembers(ctx.env));
};

export const onRequestPut: PagesFunction<Env> = async ctx => {
    const data = (await ctx.request.json().catch(() => null)) as DbMember | null;
    if (!data) return response(error(400, "no member provided"));
    return response(await updateMember(ctx.env, data));
};
