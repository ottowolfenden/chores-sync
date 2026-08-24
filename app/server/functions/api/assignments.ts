import { error, response } from "../../utils";
import { addAssignment, getAssignments, replaceAssignments } from "../../services/assignments";

export const onRequestGet: PagesFunction<Env> = async ctx => {
    const params = new URL(ctx.request.url).searchParams;
    return response(
        await getAssignments(
            ctx.env,
            params.get("date"),
            params.get("min-date"),
            params.get("max-date")
        )
    );
};

export const onRequestPost: PagesFunction<Env> = async ctx => {
    const params = new URL(ctx.request.url).searchParams;
    const data = (await ctx.request.json().catch(() => null)) as DbAssignment | DbAssignment[];
    if (!data) return response(error(400, "no assignments provided"));

    switch (params.get("action")) {
        case "add":
            return response(
                Array.isArray(data)
                    ? error(400, "must be a single assignment")
                    : await addAssignment(ctx.env, data)
            );
        case "replace":
            return response(
                Array.isArray(data)
                    ? await replaceAssignments(ctx.env, data, params.get("date"))
                    : error(400, "must be an array of assignments")
            );
        default:
            return response(error(400, "invalid action"));
    }
};
