import { getAllMembers, getMember } from "../../services/members-service";

export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        const name = new URL(context.request.url).searchParams.get("name");
        if (name) return Response.json(await getMember(context.env, name));
        return Response.json(await getAllMembers(context.env));
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
