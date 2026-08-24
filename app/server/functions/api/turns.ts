import { response } from "../../utils";
import { getTurns } from "../../services/turns";

export const onRequestGet: PagesFunction<Env> = async ctx => response(await getTurns(ctx.env));
