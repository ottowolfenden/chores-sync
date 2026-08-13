import { getChores } from "../services/chores.js";

const section = document.querySelector("section#today")!;
section.addEventListener("open", async () => {
    const controller = new AbortController();

    console.log(await getChores());

    const editButton = section.querySelector("button#edit") as HTMLButtonElement;
    const assignedList = section.querySelector("#assigned-chores > ul") as HTMLUListElement;
    const listItems = assignedList.querySelectorAll("li");
    const dropdownButtons = section.querySelectorAll(
        ".name-dropdown > button"
    ) as NodeListOf<HTMLButtonElement>;

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

    listItems.forEach(li => {
        const removeButton = li.querySelector("button.remove");
        removeButton?.addEventListener(
            "click",
            () => {
                li.style.height = li.style.opacity = "0";
                const duration = getComputedStyle(li).transitionDuration;
                setTimeout(
                    () => assignedList.removeChild(li),
                    parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000)
                );
            },
            {
                signal: controller.signal
            }
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
