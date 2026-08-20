import { checkAccess } from "../functions/cloudflare.js";
if (!(await checkAccess())) location.replace("login.html");

import "../components/assignment-list.js";
import "../components/md-icon.js";
import "../components/state-actions.js";
import "../components/num-input.js";
import "../components/section-nav.js";
import "../components/status-message.js";

import "../temp/sections/count.js";
import "../temp/sections/history.js";
import "../temp/sections/settings.js";
import "../temp/sections/today.js";

const handleRoute = async () => {
    document.querySelectorAll("section").forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("close"));
        const isTarget = s.id == location.hash.replace("#", "");
        s.hidden = !isTarget;
        if (isTarget) {
            s.dispatchEvent(new CustomEvent("open"));
            document.querySelector("main")?.scroll(0, 0);
        }
    });
};

window.addEventListener("hashchange", handleRoute);
if (!location.hash) location.replace("#today");
handleRoute();

import { addHaptics } from "../functions/haptics.js";
addHaptics("button");
