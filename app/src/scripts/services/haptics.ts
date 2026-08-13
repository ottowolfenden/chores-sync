const addHaptics = (el: Element, ms?: number) =>
    el.addEventListener("click", () => navigator.vibrate(ms ?? 1));

const addHapticsAll = (selectors: string[], rootEl?: DocumentFragment, ms?: number) => {
    (rootEl ?? document)
        .querySelectorAll(selectors.join(", "))
        .forEach(el => addHaptics(el, ms));
};

export { addHaptics, addHapticsAll };
