import { Cache } from "../classes/cache.js";
import { checkAccess } from "../functions/cloudflare.js";
import { route, refresh } from "../functions/routing.js";

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

window.addEventListener("hashchange", route);
if (!location.hash) location.replace("#today");
route();

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

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState != "visible") return;
    Cache.caches.forEach(c => c.invalidate());
    refresh();
});
