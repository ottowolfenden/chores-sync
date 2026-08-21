import { getAllChores } from "../../services/chores-service";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        return Response.json(await getAllChores(context.env));
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
