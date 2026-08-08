const getEls = (): [HTMLButtonElement, HTMLSpanElement, HTMLSpanElement] => {
    const button = document.querySelector("#sync") as HTMLButtonElement;
    const icon = button.querySelector(".icon") as HTMLSpanElement;
    const label = button.querySelector(".label") as HTMLSpanElement;
    return [button, icon, label];
};

const startAnim = (): void => {
    const [button, icon, label] = getEls();
    button.disabled = true;
    button.style.setProperty("background-color", "var(--accent)");
    icon.style.setProperty("animation-iteration-count", "infinite");
    label.textContent = "Syncing";
};

const stopAnim = (): void => {
    const [button, icon, label] = getEls();
    button.disabled = false;
    [button, icon].forEach(el => el.removeAttribute("style"));
    label.textContent = "Sync";
};

export { startAnim, stopAnim };
