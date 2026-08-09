import { checkAccess } from "./services/cloudflare.js";
if (!(await checkAccess()))
    location.replace("login.html");
const openSection = async (targetId) => {
    document.querySelectorAll("section").forEach(s => {
        const isTarget = s.id == targetId;
        s.hidden = !isTarget;
        if (isTarget)
            s.dispatchEvent(new CustomEvent("open"));
    });
    document
        .querySelectorAll("nav > a")
        .forEach(nl => nl.classList.toggle("active", nl.getAttribute("href") == "#" + targetId));
};
const handleRoute = async () => await openSection(location.hash.replace("#", ""));
window.addEventListener("hashchange", handleRoute);
document.addEventListener("DOMContentLoaded", handleRoute);
location.replace("#today");
//# sourceMappingURL=index.js.map