import { Context } from "../../services/context.js";
import { ElementUtils } from "../../services/element-utils.js";
import { Haptics } from "../../services/haptics.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const controller = new AbortController();

    const allChoresList = section.querySelector("#all > ul")!;
    const template = allChoresList.querySelector("template")!;

    const assignedStateActions = section.querySelector<StateActions>(
        "#assigned state-actions"
    )!;
    const assignmentList = section.querySelector("assignment-list")!;
    const allStatus = section.querySelector<StatusMessage>("#all > status-message")!;
    const assignedStatus = section.querySelector<StatusMessage>("#assigned > status-message")!;

    allStatus.elsToHide = [allChoresList];
    assignedStatus.elsToHide = [assignmentList, assignedStateActions];

    assignedStateActions.conf = {
        normal: {
            icon: "edit",
            label: "Edit",
            click: () => assignmentList.toggleAttribute("edit-mode", true)
        },
        active: {
            click: async () => {
                assignmentList.toggleAttribute("edit-mode", false);

                // TEMP
                await new Promise(r => setTimeout(r, 500));
                return Math.random() < 0.5;
            }
        },
        cancel: { click: () => assignmentList.toggleAttribute("edit-mode", false) },
        loading: {},
        success: {},
        error: {}
    };

    if (assignmentList.querySelector(":scope > .assignment") == null)
        assignedStatus.status = "empty";

    allStatus.status = "loading";
    const chores = await Context.chores;
    if (chores == null) allStatus.status = "error";
    else if (chores.length == 0) allStatus.status = "empty";
    else {
        allStatus.status = "success";
        const newNodes = chores.map(c => {
            const clone = template.content.cloneNode(true) as DocumentFragment;
            const li = clone.firstElementChild as HTMLLIElement;
            const addButton = clone.querySelector("button") as HTMLButtonElement;
            ElementUtils.setTexts(li, { ".chore-name": c.name, ".member-name": "temp" });
            Haptics.add(addButton);
            return clone;
        });
        allChoresList.replaceChildren(template, ...newNodes);
    }

    section.addEventListener("close", () => controller.abort(), { once: true });
});
