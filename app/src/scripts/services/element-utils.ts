const setTexts = (rootEl: DocumentFragment, selectorToText: Record<string, string>) => {
    if (!rootEl) return;
    Object.entries(selectorToText).forEach(([selector, text]) => {
        const target = rootEl.querySelector(selector);
        if (target) target.textContent = text;
    });
};

const hideAfterTransition = (el: HTMLElement) => {
    const duration = getComputedStyle(el).transitionDuration;
    setTimeout(
        () => (el.style.display = "none"),
        parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000)
    );
};

export { setTexts, hideAfterTransition };
