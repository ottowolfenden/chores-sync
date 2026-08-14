export class Haptics {
    static add = (el: Element, ms?: number) =>
        el.addEventListener("click", () => navigator.vibrate(ms ?? 1));

    static addAll = (selectors: string[], rootEl?: DocumentFragment, ms?: number) => {
        (rootEl ?? document)
            .querySelectorAll(selectors.join(", "))
            .forEach(el => this.add(el, ms));
    };
}
