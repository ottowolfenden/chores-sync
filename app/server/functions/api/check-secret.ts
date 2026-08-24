import { response, ok } from "../../utils";

export const onRequest: PagesFunction<Env> = () => response(ok({ message: "authenticated" }));
