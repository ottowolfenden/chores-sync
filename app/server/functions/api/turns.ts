export const onRequestGet: PagesFunction<Env> = async context => {
    try {
        return Response.json(null);
    } catch (err) {
        console.error(err);
        return Response.json(null, { status: 500 });
    }
};
