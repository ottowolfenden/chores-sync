import { Db } from "../services/db.js";
import { ElementUtils } from "../services/element-utils.js";
import { Haptics } from "../services/haptics.js";

const section = document.querySelector("section#today")!;

section.addEventListener("open", async () => {
    const controller = new AbortController();

    const allChoresList = section.querySelector("#all-chores > ul") as HTMLUListElement;
    const template = allChoresList.querySelector("template") as HTMLTemplateElement;
    const allChoresStatus = section.querySelector(
        "#all-chores > .status-message"
    ) as HTMLDivElement;

    // allChoresStatus.dataset.status = "loading";
    const chores = await Db.getChores();
    if (chores == null) allChoresStatus.dataset.status = "error";
    else if (chores.length == 0) allChoresStatus.dataset.status = "empty";
    else {
        allChoresStatus.removeAttribute("data-status");
        const newNodes = chores.map(c => {
            const clone = template?.content.cloneNode(true) as DocumentFragment;
            const addButton = clone.querySelector("button") as HTMLButtonElement;
            ElementUtils.setTexts(clone, { ".chore-name": c.name, ".member-name": "temp" });
            addButton.addEventListener("click", () => console.log("assign " + c.name), {
                signal: controller.signal
            });
            Haptics.add(addButton);
            return clone;
        });
        allChoresList.replaceChildren(template, ...newNodes);
    }

    const editButton = section.querySelector("button#edit") as HTMLButtonElement;
    const assignedList = section.querySelector("#assigned-chores > ul") as HTMLUListElement;
    const assignedListItems = assignedList.querySelectorAll("li");
    const dropdownButtons = section.querySelectorAll(
        ".name-dropdown > button"
    ) as NodeListOf<HTMLButtonElement>;
    const assignedChoresStatus = section.querySelector(
        "#assigned-chores > .status-message"
    ) as HTMLDivElement;
    assignedChoresStatus.removeAttribute("data-status");
    if (assignedList.querySelector(":scope > li") == null)
        assignedChoresStatus.dataset.status = "empty";

    editButton.addEventListener(
        "click",
        () => {
            const icon = editButton.querySelector(".icon") as HTMLSpanElement;
            const label = editButton.querySelector(".icon + span") as HTMLSpanElement;
            assignedList.toggleAttribute("inert");
            if (assignedList.hasAttribute("inert")) {
                label.textContent = "Edit";
                icon.textContent = "edit";
            } else {
                icon.textContent = "check";
                label.textContent = "Save";
            }
        },
        { signal: controller.signal }
    );

    assignedListItems.forEach(li => {
        const removeButton = li.querySelector("button.remove");
        removeButton?.addEventListener(
            "click",
            () => {
                ElementUtils.withTransition(
                    li,
                    () => (li.style.height = li.style.opacity = li.style.marginTop = "0"),
                    () => {
                        li.remove();
                        if (assignedList.querySelector(":scope > li") == null)
                            assignedChoresStatus.dataset.status = "empty";
                    }
                );
            },
            { signal: controller.signal }
        );
    });

    dropdownButtons.forEach((db, i) => {
        const popover = db.nextElementSibling as HTMLDivElement;
        const dropdownIcon = db.querySelector(".icon") as HTMLSpanElement;
        const memberName = db.querySelector(".member-name") as HTMLSpanElement;
        const popoverButtons = popover.querySelectorAll("button");

        db.popoverTargetElement = popover;
        db.style.anchorName = popover.style.positionAnchor = `--dropdown-anchor-${i}`;

        popover.addEventListener(
            "toggle",
            e =>
                (dropdownIcon.textContent =
                    e.newState == "open" ? "arrow_drop_up" : "arrow_drop_down"),
            { signal: controller.signal }
        );
        popoverButtons.forEach(pb =>
            pb.addEventListener(
                "click",
                () => {
                    popover.hidePopover();
                    [pb.textContent, memberName.textContent] = [
                        memberName.textContent,
                        pb.textContent
                    ];
                },
                { signal: controller.signal }
            )
        );
    });

    section.addEventListener("close", () => controller.abort(), { once: true });
});
