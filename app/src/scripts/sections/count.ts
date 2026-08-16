import { Haptics } from "../services/haptics.js";
import { Db } from "../services/db.js";
import { ElementUtils } from "../services/element-utils.js";

const section = document.querySelector("section#count")!;

section.addEventListener("open", async () => {
    const controller = new AbortController();

    const countStatus = section.querySelector(".status-message") as HTMLDivElement;
    countStatus.dataset.status = "loading";
    const counts = await Db.getCounts();

    if (counts == null) {
        countStatus.dataset.status = "error";
        return;
    } else if (counts.length == 0) {
        countStatus.dataset.status = "empty";
        return;
    }

    countStatus.removeAttribute("data-status");

    const choreUL = section.querySelector(":scope > ul") as HTMLUListElement;
    const choreLITemplate = section.querySelector("template") as HTMLTemplateElement;

    const choreLIs = counts.map(count => {
        const clone = choreLITemplate.content.cloneNode(true) as DocumentFragment;
        const choreLI = clone.firstElementChild as HTMLLIElement;
        ElementUtils.setTexts(choreLI, {
            ".chore-name": count.choreName,
            ".total-count .num": count.memberCounts.reduce((acc, val) => acc + val.total, 0)
        });

        const choreDetailsUL = choreLI.querySelector(":scope > ul") as HTMLUListElement;
        const choreDetailsLITemplate = choreDetailsUL.querySelector(
            "template"
        ) as HTMLTemplateElement;

        const choreDetailsLIs = count.memberCounts.map(memberCount => {
            const clone = choreDetailsLITemplate.content.cloneNode(true) as DocumentFragment;
            const choreDetailsLI = clone.firstElementChild as HTMLLIElement;
            ElementUtils.setTexts(choreDetailsLI, {
                ".member-name": memberCount.memberName,
                ".count-text .num": memberCount.total,
                ".offset .num": (() => {
                    if (memberCount.offset > 0) return `+${memberCount.offset}`;
                    else if (memberCount.offset < 0) return memberCount.offset;
                    else return "";
                })()
            });

            return clone;
        });

        choreDetailsUL.replaceChildren(choreLITemplate, ...choreDetailsLIs);
        return clone;
    });

    choreUL.replaceChildren(choreLITemplate, ...choreLIs);

    const refreshEditState = (li: HTMLLIElement) => {
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

            const detailsListItems = li.querySelectorAll(
                "ul.details > li"
            ) as NodeListOf<HTMLLIElement>;
            detailsListItems.forEach(dli => {
                const numInput = dli.querySelector("input") as HTMLInputElement;
                const numText = dli.querySelector(".count-text .num") as HTMLSpanElement;
                numInput.value = numText.textContent;
            });
        }
    };

    const toggleCollapse = (li: HTMLLIElement, collapse?: boolean) => {
        const detailsList = li.querySelector("ul.details") as HTMLUListElement;
        const icon = li.querySelector(".chore .expand .icon") as HTMLSpanElement;
        collapse ??= detailsList.inert;
        detailsList.toggleAttribute("inert", !collapse);
        icon.textContent = `keyboard_arrow_${detailsList.inert ? "down" : "up"}`;
        if (collapse) li.toggleAttribute("data-edit-mode", false);
        refreshEditState(li);
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
    const expandAllButton = section.querySelector("#expand-all") as HTMLButtonElement;
    expandAllButton.addEventListener(
        "click",
        () => {
            const label = expandAllButton.querySelector(".icon + span") as HTMLSpanElement;
            listItems.forEach(li => toggleCollapse(li, label.textContent == "Expand all"));
            refreshExpandAllButtonState();
        },
        { signal: controller.signal }
    );

    const changeNum = (newNum: string | number, detailsListItem: HTMLLIElement) => {
        const numInput = detailsListItem.querySelector("input") as HTMLInputElement;
        const numText = detailsListItem.querySelector(".count-text .num") as HTMLSpanElement;
        const offset = detailsListItem.querySelector(".offset") as HTMLSpanElement;
        const offsetNum = detailsListItem.querySelector(".offset .num") as HTMLSpanElement;

        const oldNum = numText.textContent;
        const newNumInt: number = parseInt(newNum.toString());
        if (Math.abs(newNumInt) > 100_000 || isNaN(newNumInt)) {
            numInput.textContent = oldNum;
            return;
        }

        const difference = newNumInt - parseInt(numText.textContent);
        numText.textContent = numInput.value = newNum.toString();
        const newOffset =
            parseInt(offsetNum.textContent == "" ? "0" : offsetNum.textContent) + difference;
        offset.style.display = newOffset == 0 ? "none" : "";
        if (newOffset > 0) offsetNum.textContent = `+${newOffset}`;
        else offsetNum.textContent = newOffset.toString();
    };

    const listItems = section.querySelectorAll(
        ":scope > ul > li"
    ) as NodeListOf<HTMLLIElement>;
    const detailsLists = [...listItems].flatMap(li => li.querySelector("ul.details"));

    listItems.forEach(li => {
        const choreItem = li.querySelector("div.chore") as HTMLDivElement;
        const editButton = choreItem.querySelector("button.edit") as HTMLButtonElement;

        Haptics.add(choreItem);
        Haptics.add(editButton);

        choreItem?.addEventListener(
            "click",
            () => {
                toggleCollapse(li);
                refreshExpandAllButtonState();
            },
            { signal: controller.signal }
        );
        editButton.addEventListener(
            "click",
            e => {
                e.stopPropagation();
                li.toggleAttribute("data-edit-mode");
                refreshEditState(li);
            },
            { signal: controller.signal }
        );

        const detailsListItems = li.querySelectorAll(
            "ul.details > li"
        ) as NodeListOf<HTMLLIElement>;
        detailsListItems.forEach(dli => {
            const minusButton = dli.querySelector(".minus") as HTMLButtonElement;
            const plusButton = dli.querySelector(".plus") as HTMLButtonElement;
            const numInput = dli.querySelector("input") as HTMLInputElement;
            const numText = dli.querySelector(".count-text .num") as HTMLSpanElement;

            Haptics.add(minusButton);
            Haptics.add(plusButton);

            numInput.value = numText.textContent;

            numInput.addEventListener("click", () => numInput.select(), {
                signal: controller.signal
            });

            numInput.addEventListener("input", e => changeNum(numInput.value, dli), {
                signal: controller.signal
            });

            numInput.addEventListener(
                "keydown",
                e => {
                    li.toggleAttribute("data-edit-mode", e.key != "Enter");
                    refreshEditState(li);
                },
                { signal: controller.signal }
            );

            minusButton.addEventListener(
                "click",
                () => changeNum(parseInt(numInput.value) - 1, dli),
                { signal: controller.signal }
            );

            plusButton.addEventListener(
                "click",
                () => changeNum(parseInt(numInput.value) + 1, dli),
                { signal: controller.signal }
            );
        });
    });

    section.addEventListener("close", () => controller.abort(), { once: true });
});
