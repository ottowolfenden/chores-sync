import { queryAll } from "./element-utils";

export const addHaptics = (
    els: string | Element | (Element | string)[],
    {
        event = "click",
        rootNode = document,
        ms = 1
    }: { event?: string; rootNode?: ParentNode; ms?: number } = {}
) => {
    if (!("vibrate" in navigator)) return;
    const vibrate = () => navigator.vibrate(ms);
    queryAll(els, rootNode).forEach(el => {
        el.removeEventListener(event, vibrate);
        el.addEventListener(event, vibrate);
    });
};

const patterns = { "success": [3], "error": [40, 90, 40, 90, 40] };

export const vibrate = (param: "success" | "error" | boolean | number) => {
    if (!("vibrate" in navigator)) return;
    if (typeof param == "boolean") param = param ? "success" : "error";
    if (typeof param == "string") navigator.vibrate(patterns[param]);
    if (typeof param == "number") navigator.vibrate(param);
};
