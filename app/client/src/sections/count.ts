import { getCounts } from "../functions/db.js";
import { Context } from "../classes/context.js";

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

    const refreshStateActions = (e: Event) =>
        (stateActions.state = (e as CustomEvent).detail.allCollapsed ? "normal" : "active");
    window.addEventListener("count-collapse-toggle", refreshStateActions);

    message.status = "loading";
    const counts = await getCounts();
    if (counts == null) message.status = "error";
    else if (counts.length == 0) message.status = "empty";
    else {
        message.status = "success";
        countsList.counts = counts;
    }

    section.addEventListener(
        "close",
        () => {
            window.removeEventListener("count-collapse-toggle", refreshStateActions);
            Context.updateTurns();
        },
        { once: true }
    );
});
