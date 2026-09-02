export const addHaptics = (
    els: string | Element | (Element | string)[],
    rootNode?: ParentNode,
    ms?: number
) => {
    if (!("vibrate" in navigator)) return;

    const query = (sel: string) => [...(rootNode ?? document).querySelectorAll(sel)];
    let elsToAdd: Element[] = [];
    if (typeof els == "string") elsToAdd = query(els);
    else if (els instanceof Element) elsToAdd = [els];
    else els.forEach(el => elsToAdd.concat(typeof el == "string" ? query(el) : [el]));

    const vibrate = () => navigator.vibrate(ms ?? 1);
    elsToAdd.forEach(el => {
        el.removeEventListener("click", vibrate);
        el.addEventListener("click", vibrate);
    });
};
