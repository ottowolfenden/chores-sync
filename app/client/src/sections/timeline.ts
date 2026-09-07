import "../components/timeline-list.js";
import { withTransition } from "../functions/element-utils.js";

const section = document.querySelector("section#timeline")!;

const ui = {
    timelineList: section.querySelector("timeline-list")!,
    recentreButton: section.querySelector<HTMLButtonElement>("#recentre")!
};

Object.assign(ui.recentreButton.style, { opacity: "0", scale: "0.4" });
ui.timelineList.addEventListener("scroll", () => {
    withTransition(ui.recentreButton, {
        before: () => (ui.recentreButton.hidden = false),
        after: { opacity: "", scale: "" }
    });
});
ui.recentreButton.onclick = async () => {
    withTransition(ui.recentreButton, {
        before: { opacity: "0", scale: "0.4" },
        after: () => (ui.recentreButton.hidden = true)
    });
    ui.timelineList.recentre();
};

section.addEventListener("sectionopen", () => ui.timelineList.reset({ collapseAll: true }));
section.addEventListener("sectionclose", () => ui.timelineList.reset({ collapseAll: true }));
