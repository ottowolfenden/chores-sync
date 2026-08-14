const setTexts = (rootEl: DocumentFragment, selectorToText: Record<string, string>) => {
    if (!rootEl) return;
    Object.entries(selectorToText).forEach(([selector, text]) => {
        const target = rootEl.querySelector(selector);
        if (target) target.textContent = text;
    });
};

const withTransition = (el: HTMLElement, before: () => void, after: () => void) => {
    before();
    const duration = getComputedStyle(el).transitionDuration;
    const delay = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
    setTimeout(() => after(), delay);
};

export { setTexts, withTransition };
