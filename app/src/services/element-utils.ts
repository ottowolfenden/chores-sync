export class ElementUtils {
    private constructor() {}

    static setTexts = (
        rootEl: HTMLElement,
        selectorToText: Record<string, string | number>
    ) => {
        if (!rootEl) return;
        Object.entries(selectorToText).forEach(([selector, text]) => {
            const target = rootEl.querySelector(selector);
            if (target) target.textContent = text.toString();
        });
    };

    static withTransition = (
        el: HTMLElement,
        before: (() => void) | Record<string, string> = () => {},
        after: (() => void) | Record<string, string> = () => {}
    ) => {
        const handleEvent = (event: (() => void) | Record<string, string>) =>
            (typeof event == "function"
                ? () => event()
                : () => Object.assign(el.style, event))();
        handleEvent(before);
        const duration = getComputedStyle(el).transitionDuration;
        const delay = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
        setTimeout(() => handleEvent(after), delay);
    };
}
