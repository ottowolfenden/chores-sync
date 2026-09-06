import { Cache } from "../classes/cache";
import "../components/counts-list";

const section = document.querySelector("section#count")!;

section.addEventListener("open", async () => {
    const stateActions = section.querySelector("state-actions")!;
    const countsList = section.querySelector("counts-list")!;
    const message = section.querySelector("status-message")!;

    stateActions.conf = {
        normal: {
            icon: "expand_content",
            label: "Expand all",
            click: () => (countsList.allCollapsed = false)
        },
        active: {
            icon: "collapse_content",
            label: "Collapse all",
            withTransition: false,
            click: () => (countsList.allCollapsed = true)
        }
    };

    message.elsToHide = [countsList, stateActions];
    message.caches = [Cache.counts, Cache.members];

    const refreshStateActions = () =>
        (stateActions.state = countsList.allCollapsed ? "normal" : "active");
    refreshStateActions();
    window.addEventListener("count-collapse-toggle", refreshStateActions);

    message.status = "loading";
    const counts = await Cache.counts.get();
    if (counts == null) message.status = "error";
    else if (counts.length == 0) message.status = "empty";
    else {
        message.status = "success";
        countsList.counts = counts;
    }

    section.addEventListener(
        "close",
        () => {
            countsList.allCollapsed = true;
            refreshStateActions();
            window.removeEventListener("count-collapse-toggle", refreshStateActions);
        },
        { once: true }
    );
});
