import "../components/timeline-list.js";
import { withTransition } from "../functions/element-utils.js";
import { addHaptics } from "../functions/haptics.js";
import { throttle } from "../functions/timer.js";

const section = document.querySelector("section#timeline")!;

const ui = {
    timelineList: section.querySelector("timeline-list")!,
    recentreButton: section.querySelector<HTMLButtonElement>("#recentre")!,
    recentreIcon: section.querySelector("#recentre md-icon")!
};

const inactiveRecentreButtonStyle = { opacity: "0", scale: "0.4" };

const refreshRecentreIcon = () =>
    (ui.recentreIcon.textContent =
        ui.timelineList.getScrolledDirection() == "up" ? "arrow_downward" : "arrow_upward");

ui.timelineList.addEventListener("scrollend", refreshRecentreIcon);
ui.timelineList.addEventListener("scroll", throttle(refreshRecentreIcon, 200));

ui.timelineList.addEventListener("userscroll", () =>
    withTransition(ui.recentreButton, {
        before: () => (ui.recentreButton.hidden = false),
        after: { opacity: "", scale: "" }
    })
);

ui.recentreButton.onclick = async () => {
    withTransition(ui.recentreButton, {
        before: inactiveRecentreButtonStyle,
        after: () => (ui.recentreButton.hidden = true)
    });
    ui.timelineList.recentre();
};

section.addEventListener("sectionopen", () => {
    ui.timelineList.reset({ collapseAll: true });
    ui.recentreButton.hidden = true;
    Object.assign(ui.recentreButton.style, inactiveRecentreButtonStyle);
    addHaptics(ui.recentreButton);
});
section.addEventListener("sectionclose", () => ui.timelineList.reset({ collapseAll: true }));
