import { getMembers } from "../../services/members";
import { response } from "../../utils";

export const onRequestGet: PagesFunction<Env> = async ctx => {
    const name = new URL(ctx.request.url).searchParams.get("name");
    return response(await getMembers(ctx.env, name));
};
