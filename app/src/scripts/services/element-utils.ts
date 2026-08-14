export class ElementUtils {
    private constructor() {}

    static setTexts = (rootEl: DocumentFragment, selectorToText: Record<string, string>) => {
        if (!rootEl) return;
        Object.entries(selectorToText).forEach(([selector, text]) => {
            const target = rootEl.querySelector(selector);
            if (target) target.textContent = text;
        });
    };

    static withTransition = (el: HTMLElement, before: () => void, after: () => void) => {
        before();
        const duration = getComputedStyle(el).transitionDuration;
        const delay = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
        setTimeout(() => after(), delay);
    };
}
