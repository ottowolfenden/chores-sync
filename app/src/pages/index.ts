import "../temp/sections/count.js";
import "../temp/sections/history.js";
import "../temp/sections/settings.js";
import "../temp/sections/today.js";

import "../components/section-nav.js";
import "../components/status-message.js";

import { Cloudflare } from "../services/cloudflare.js";
import { Haptics } from "../services/haptics.js";

if (!(await Cloudflare.checkAccess())) location.replace("login.html");

const openSection = async (targetId: string) => {
    document.querySelectorAll("section").forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("close"));
        const isTarget = s.id == targetId;
        s.hidden = !isTarget;
        if (isTarget) {
            s.dispatchEvent(new CustomEvent("open"));
            document.querySelector("main")?.scroll(0, 0);
        }
    });
};

const handleRoute = async () => await openSection(location.hash.replace("#", ""));
window.addEventListener("hashchange", handleRoute);
if (!location.hash) location.replace("#today");
handleRoute();

Haptics.addAll(["button"]);
