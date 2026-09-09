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

export const vibrate = (event: "success" | "error" | boolean) => {
    if (!("vibrate" in navigator)) return;
    if (typeof event == "boolean") event = event ? "success" : "error";
    navigator.vibrate(patterns[event]);
};
