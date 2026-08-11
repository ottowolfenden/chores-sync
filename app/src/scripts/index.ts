import "./sections/count.js";
import "./sections/history.js";
import "./sections/settings.js";
import "./sections/today.js";
import { checkAccess } from "./services/cloudflare.js";

if (!(await checkAccess())) location.replace("login.html");

const openSection = async (targetId: string) => {
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
if (!location.hash) location.replace("#today");
handleRoute();

document
    .querySelectorAll("button, a, input[type='checkbox']")
    .forEach(el => el.addEventListener("click", () => navigator.vibrate(1)));
