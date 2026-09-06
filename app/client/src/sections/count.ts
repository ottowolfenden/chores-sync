import { Cache } from "../classes/cache";
import "../components/counts-list";

const section = document.querySelector("section#count")!;

const ui = {
    stateActions: section.querySelector("state-actions")!,
    list: section.querySelector("counts-list")!,
    message: section.querySelector("status-message")!
};

ui.stateActions.conf = {
    normal: {
        icon: "expand_content",
        label: "Expand all",
        click: () => (ui.list.allCollapsed = false)
    },
    active: {
        icon: "collapse_content",
        label: "Collapse all",
        withTransition: false,
        click: () => (ui.list.allCollapsed = true)
    }
};

ui.message.elsToHide = [ui.list, ui.stateActions];
ui.message.caches = [Cache.counts, Cache.members];

const refreshStateActions = () =>
    (ui.stateActions.state = ui.list.allCollapsed ? "normal" : "active");

window.addEventListener("count-collapse-toggle", refreshStateActions);

section.addEventListener("sectionopen", async () => {
    refreshStateActions();
    if (!Cache.counts.isCached) ui.message.status = "loading";
    const counts = await Cache.counts.get();
    if (counts == null) ui.message.status = "error";
    else if (counts.length == 0) ui.message.status = "empty";
    else {
        ui.message.status = "success";
        ui.list.counts = counts;
    }
});

section.addEventListener("sectionclose", () => {
    ui.list.allCollapsed = true;
    refreshStateActions();
});
