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

export const instantly = <T = void>(
    els: HTMLElement | HTMLElement[],
    callback: () => T
): T => {
    els = Array.isArray(els) ? els : [els];
    els.forEach(el => (el.style.transition = el.style.animation = "none"));
    const result = callback();
    requestAnimationFrame(() =>
        els.forEach(el => (el.style.transition = el.style.animation = ""))
    );
    return result;
};

export const queryAll = (
    els: string | Element | (Element | string)[],
    rootNode: ParentNode = document
) => {
    const query = (sel: string) => [...rootNode.querySelectorAll(sel)];
    let result: Element[] = [];
    if (typeof els == "string") result = query(els);
    else if (els instanceof Element) result = [els];
    else els.forEach(el => (result = result.concat(typeof el == "string" ? query(el) : [el])));
    return result;
};

export const addAnimClass = (el: HTMLElement, className: string = "animate") => {
    el.classList.add(className);
    el.addEventListener("animationend", () => el.classList.remove(className));
};
