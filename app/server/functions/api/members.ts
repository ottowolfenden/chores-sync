import { getMembers, setHighScore } from "../../services/members";
import { error, response } from "../../utils";

export const onRequestGet: PagesFunction<Env> = async ctx => {
    const name = new URL(ctx.request.url).searchParams.get("name");
    return response(await getMembers(ctx.env, name));
};

export const onRequestPut: PagesFunction<Env> = async ctx => {
    const params = new URL(ctx.request.url).searchParams;
    const toInt = (param: string | null) => (param === null ? null : parseInt(param));
    return response(
        params.get("action") == "update-high-score"
            ? await setHighScore(ctx.env, {
                  id: toInt(params.get("id")),
                  highScore: toInt(params.get("high-score"))
              })
            : error(400, "invalid action")
    );
};
