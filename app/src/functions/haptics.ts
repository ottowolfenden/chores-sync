export const add = (
    els: string | Element | (Element | string)[],
    rootNode?: ParentNode,
    ms?: number
) => {
    const query = (sel: string) => [...(rootNode ?? document).querySelectorAll(sel)];
    let elsToAdd: Element[] = [];

    if (typeof els == "string") elsToAdd = query(els);
    else if (els instanceof Element) elsToAdd = [els];
    else els.forEach(el => elsToAdd.concat(typeof el == "string" ? query(el) : [el]));

    elsToAdd.forEach(el => el.addEventListener("click", () => navigator.vibrate(ms ?? 1)));
};
