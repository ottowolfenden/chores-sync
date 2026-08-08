const getEls = () => {
    const button = document.querySelector("#sync");
    const icon = button.querySelector(".icon");
    const label = button.querySelector(".label");
    return [button, icon, label];
};
const startAnim = () => {
    const [button, icon, label] = getEls();
    button.disabled = true;
    button.style.setProperty("background-color", "var(--accent)");
    icon.style.setProperty("animation-iteration-count", "infinite");
    label.textContent = "Syncing";
};
const stopAnim = () => {
    const [button, icon, label] = getEls();
    button.disabled = false;
    [button, icon].forEach(el => el.removeAttribute("style"));
    label.textContent = "Sync";
};
export { startAnim, stopAnim };
//# sourceMappingURL=sync-button.js.map