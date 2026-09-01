import { ref as litRef } from "lit/directives/ref.js";
import { delay } from "./timer";

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

type TransitionEvent = (() => void) | (() => Promise<void>) | Record<string, string>;
export const withTransition = async (
    el: HTMLElement | null,
    before: TransitionEvent = () => {},
    after: TransitionEvent = () => {}
) => {
    if (!el) return;
    const handleEvent = async (event: TransitionEvent) => {
        if (typeof event == "function") await event();
        else Object.assign(el.style, event);
    };
    await handleEvent(before);
    const durationStr = getComputedStyle(el).transitionDuration.split(",")[0]?.trim() ?? "";
    const duration = parseFloat(durationStr) * (durationStr.endsWith("ms") ? 1 : 1000);
    if (duration > 0) await delay(duration);
    await handleEvent(after);
};

export const queryClosest = <T extends HTMLElement = HTMLElement>(e: Event, sel: string) =>
    e.target instanceof HTMLElement ? (e.target as HTMLElement).closest<T>(sel) : null;

export const ref = <T extends HTMLElement>(set: (el: T) => void) => litRef(el => set(el as T));
