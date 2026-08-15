import { Haptics } from "../services/haptics.js";

const section = document.querySelector("section#count")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    const expandAllButton = section.querySelector("#expand-all") as HTMLButtonElement;
    const collapseAllButton = section.querySelector("#collapse-all") as HTMLButtonElement;
    const listItems = section.querySelectorAll(
        ":scope > ul > li"
    ) as NodeListOf<HTMLLIElement>;

    const setCollapseState = (li: HTMLLIElement, collapse?: boolean) => {
        const detailsList = li.querySelector("ul.details") as HTMLUListElement;
        const icon = li.querySelector(".chore .expand .icon") as HTMLSpanElement;
        collapse ??= detailsList.inert;
        detailsList.toggleAttribute("inert", !collapse);
        icon.textContent = `keyboard_arrow_${detailsList.inert ? "down" : "up"}`;
        if (collapse) li.toggleAttribute("data-edit-mode", false);
    };

    [expandAllButton, collapseAllButton].forEach(b =>
        b.addEventListener(
            "click",
            () => listItems.forEach(li => setCollapseState(li, b.id == "expand-all")),
            { signal: controller.signal }
        )
    );

    listItems.forEach(li => {
        const choreItem = li.querySelector("div.chore") as HTMLDivElement;
        Haptics.add(choreItem);
        choreItem?.addEventListener("click", () => setCollapseState(li), {
            signal: controller.signal
        });
        choreItem?.querySelectorAll("button").forEach(b =>
            b.addEventListener(
                "click",
                e => {
                    if (b.classList.contains("expand")) return;
                    e.stopPropagation();
                    li.toggleAttribute("data-edit-mode", b.classList.contains("edit"));
                },
                { signal: controller.signal }
            )
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
