import { Haptics } from "../services/haptics.js";

const section = document.querySelector("section#count")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    const expandAllButton = section.querySelector("#expand-all") as HTMLButtonElement;
    const listItems = section.querySelectorAll(
        ":scope > ul > li"
    ) as NodeListOf<HTMLLIElement>;
    const detailsLists = [...listItems].flatMap(li => li.querySelector("ul.details"));

    const refreshEditButtonState = (li: HTMLLIElement) => {
        const choreItem = li.querySelector("div.chore") as HTMLDivElement;
        const editButton = choreItem.querySelector("button.edit") as HTMLButtonElement;
        const icon = editButton.querySelector(".icon") as HTMLSpanElement;
        const label = editButton.querySelector(".icon + span") as HTMLSpanElement;
        if (li.hasAttribute("data-edit-mode")) {
            label.textContent = "Save";
            icon.textContent = "check";
        } else {
            label.textContent = "Edit";
            icon.textContent = "edit";
        }
    };

    const toggleCollapse = (li: HTMLLIElement, collapse?: boolean) => {
        const detailsList = li.querySelector("ul.details") as HTMLUListElement;
        const icon = li.querySelector(".chore .expand .icon") as HTMLSpanElement;
        collapse ??= detailsList.inert;
        detailsList.toggleAttribute("inert", !collapse);
        icon.textContent = `keyboard_arrow_${detailsList.inert ? "down" : "up"}`;
        if (collapse) li.toggleAttribute("data-edit-mode", false);
        refreshEditButtonState(li);
    };

    const refreshExpandAllButtonState = () => {
        const icon = expandAllButton.querySelector(".icon") as HTMLSpanElement;
        const label = expandAllButton.querySelector(".icon + span") as HTMLSpanElement;
        if (!detailsLists.every(ul => ul?.hasAttribute("inert"))) {
            label.textContent = "Collapse all";
            icon.textContent = "collapse_content";
        } else {
            label.textContent = "Expand all";
            icon.textContent = "expand_content";
        }
    };

    expandAllButton.addEventListener(
        "click",
        () => {
            const label = expandAllButton.querySelector(".icon + span") as HTMLSpanElement;
            listItems.forEach(li => toggleCollapse(li, label.textContent == "Expand all"));
            refreshExpandAllButtonState();
        },
        { signal: controller.signal }
    );

    listItems.forEach(li => {
        const choreItem = li.querySelector("div.chore") as HTMLDivElement;
        const editButton = choreItem.querySelector("button.edit") as HTMLButtonElement;

        Haptics.add(choreItem);
        choreItem?.addEventListener(
            "click",
            () => {
                toggleCollapse(li);
                refreshExpandAllButtonState();
            },
            {
                signal: controller.signal
            }
        );
        editButton.addEventListener(
            "click",
            e => {
                e.stopPropagation();
                li.toggleAttribute("data-edit-mode");
                refreshEditButtonState(li);
            },
            { signal: controller.signal }
        );
        const detailsListItems = li.querySelectorAll(
            "ul.details > li"
        ) as NodeListOf<HTMLLIElement>;
        detailsListItems.forEach(dli => {
            const minusButton = dli.querySelector(".minus") as HTMLButtonElement;
            const numInput = dli.querySelector("input") as HTMLInputElement;
            const plusButton = dli.querySelector(".plus") as HTMLButtonElement;
            const numText = dli.querySelector(".count-text") as HTMLSpanElement;
            const offset = dli.querySelector(".offset") as HTMLSpanElement;

            numInput.addEventListener("click", () => numInput.select(), {
                signal: controller.signal
            });
            minusButton.addEventListener("click", () => {
                const num = parseInt(numInput.value);
                if (isNaN(num)) return;
            });
        });
    });

    section.addEventListener("close", () => controller.abort(), { once: true });
});
