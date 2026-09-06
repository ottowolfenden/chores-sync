import { ref as litRef } from "lit/directives/ref.js";
import { delay } from "./timer";

type TransitionEvent = (() => void) | (() => Promise<void>) | Record<string, string>;

export const withTransition = async (
    el: EventTarget | null,
    events: { before?: TransitionEvent; after?: TransitionEvent }
) => {
    if (!el || !(el instanceof HTMLElement)) return;
    const handleEvent = async (event?: TransitionEvent) => {
        if (!event) return;
        if (typeof event == "function") await event();
        else Object.assign(el.style, event);
    };
    await handleEvent(events.before);
    const durationStr = getComputedStyle(el).transitionDuration.split(",")[0]?.trim() ?? "";
    const duration = parseFloat(durationStr) * (durationStr.endsWith("ms") ? 1 : 1000);
    if (duration > 0) await delay(duration);
    await handleEvent(events.after);
};

export const queryClosest = <T extends HTMLElement = HTMLElement>(e: Event, sel: string) =>
    e.target instanceof HTMLElement ? (e.target as HTMLElement).closest<T>(sel) : null;

export const ref = <T extends HTMLElement>(set: (el: T) => void) => litRef(el => set(el as T));

export const instantly = (el: HTMLElement, callback: () => void) => {
    const orgTransition = el.style.transition;
    el.style.transition = "none";
    callback();
    el.offsetHeight;
    el.style.transition = orgTransition;
};
