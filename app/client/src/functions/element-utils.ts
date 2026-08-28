export const setTexts = (
    rootEl: HTMLElement,
    selectorToText: Record<string, string | number>
) => {
    if (!rootEl) return;
    Object.entries(selectorToText).forEach(([selector, text]) => {
        const target = rootEl.querySelector(selector);
        if (target) target.textContent = text.toString();
    });
};

export const withTransition = (
    el: HTMLElement | null,
    before: (() => void) | Record<string, string> = () => {},
    after: (() => void) | Record<string, string> = () => {}
) => {
    if (!el) return;
    const handleEvent = (event: (() => void) | Record<string, string>) =>
        (typeof event == "function" ? () => event() : () => Object.assign(el.style, event))();
    handleEvent(before);
    const duration = getComputedStyle(el).transitionDuration;
    const delay = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
    setTimeout(() => handleEvent(after), delay);
};

export const queryClosest = <T extends HTMLElement = HTMLElement>(e: Event, sel: string) =>
    e.target instanceof HTMLElement ? (e.target as HTMLElement).closest<T>(sel) : null;
