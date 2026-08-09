import { get } from "./services/neon.js";
import { checkAccess } from "./services/cloudflare.js";

const openSection = async (targetId: string) => {
    if ((location.hash == "#login") == (await checkAccess())) {
        history.back();
        return;
    }
    document.querySelectorAll("section").forEach(s => {
        const isTarget = s.id == targetId;
        s.hidden = !isTarget;
        if (isTarget) s.dispatchEvent(new CustomEvent("open"));
    });
    document
        .querySelectorAll("nav > a")
        .forEach(nl =>
            nl.classList.toggle("active", nl.getAttribute("href") == "#" + targetId)
        );
};

const handleRoute = async () => await openSection(location.hash.replace("#", ""));
window.addEventListener("hashchange", handleRoute);
document.addEventListener("DOMContentLoaded", handleRoute);

console.log(await checkAccess());
if (location.hash != "#login" && !(await checkAccess())) {
    location.replace("#login");
} else if (!location.hash) location.replace("#today");

const syncButton = document.querySelector("button#sync") as HTMLButtonElement;
const label = syncButton.querySelector("span.label") as HTMLSpanElement;

syncButton.addEventListener("click", async () => {
    syncButton.disabled = true;
    syncButton.classList.add("syncing");
    label.textContent = "Syncing";
    await get();
    syncButton.disabled = false;
    syncButton.classList.remove("syncing");
    label.textContent = "Sync";
});
syncButton.click();
