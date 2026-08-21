export const onRequest: PagesFunction<Env> = async () =>
    Response.json({ message: "authenticated" });
