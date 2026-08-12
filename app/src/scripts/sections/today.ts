const section = document.querySelector("section#today")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    const editButton = section.querySelector("button#edit") as HTMLButtonElement;
    const assignedList = section.querySelector("#assigned > ul") as HTMLUListElement;
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

    const dropdownButtons = section.querySelectorAll(
        ".member-name-dropdown > button"
    ) as NodeListOf<HTMLButtonElement>;
    dropdownButtons.forEach((b, i) => {
        const popover = b.nextElementSibling;
        const anchorName = `--dropdown-anchor-${i}`;
        const icon = b.querySelector(".icon");
        if (!(popover instanceof HTMLElement && icon instanceof HTMLElement)) return;

        b.popoverTargetElement = popover;
        b.style.anchorName = anchorName;
        popover.style.positionAnchor = anchorName;

        popover.addEventListener(
            "toggle",
            e =>
                (icon.textContent =
                    e.newState == "open" ? "arrow_drop_up" : "arrow_drop_down"),
            { signal: controller.signal }
        );
    });

    section.addEventListener("close", () => controller.abort(), { once: true });
});
