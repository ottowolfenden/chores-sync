import { Cache } from "../classes/cache.js";
import { checkAccess } from "../functions/cloudflare.js";

if (!(await checkAccess())) location.replace("login.html");
else
    await Promise.all([
        import("../components/md-icon.js"),
        import("../components/state-actions.js"),
        import("../components/num-input.js"),
        import("../components/section-nav.js"),
        import("../components/status-message.js"),
        import("../sections/count.js"),
        import("../sections/timeline.js"),
        import("../sections/settings.js"),
        import("../sections/today.js")
    ]);

const handleRoute = async () => {
    document.querySelectorAll("section").forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("close"));
        const isTarget = s.id == location.hash.replace("#", "");
        if (isTarget) s.dispatchEvent(new CustomEvent("open"));
        s.hidden = !isTarget;
        document.querySelector("main")?.scroll(0, 0);
    });
};

window.addEventListener("hashchange", handleRoute);
if (!location.hash) location.replace("#today");
handleRoute();

const updateManifest = () =>
    document
        .querySelector(`link[rel="manifest"]`)
        ?.setAttribute(
            "href",
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "assets/site-dark.webmanifest"
                : "assets/site-light.webmanifest"
        );

updateManifest();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateManifest);

if (location.hash) {
    if (location.hash != "#count") await Cache.counts.get();
    if (location.hash != "#today") await Cache.turns.get();
    await Cache.todayAssignments.get();
}
