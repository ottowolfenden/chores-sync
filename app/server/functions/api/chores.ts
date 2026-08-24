import { getAllChores } from "../../services/chores";
import { response } from "../../utils";

export const onRequestGet: PagesFunction<Env> = async ctx =>
    response(await getAllChores(ctx.env));
