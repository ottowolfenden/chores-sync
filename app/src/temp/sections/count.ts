import * as Haptics from "../../services/haptics.js";
import { Db } from "../../services/db.js";
import { setTexts } from "../../services/element-utils.js";

const section = document.querySelector("section#count")!;

section.addEventListener("open", async () => {
    const controller = new AbortController();

    const statusMessage = section.querySelector("status-message")!;
    statusMessage.elsToHide = [
        section.querySelector(":scope > ul"),
        section.querySelector("button#expand-all")
    ];
    statusMessage.status = "loading";
    const counts = await Db.getCounts();

    if (counts == null) {
        statusMessage.status = "error";
        return;
    } else if (counts.length == 0) {
        statusMessage.status = "empty";
        return;
    }

    statusMessage.status = "success";

    const choreUL = section.querySelector(":scope > ul")!;
    const choreLITemplate = section.querySelector("template")!;

    const choreLIs = counts.map(count => {
        const clone = choreLITemplate.content.cloneNode(true) as DocumentFragment;
        const choreLI = clone.firstElementChild as HTMLLIElement;
        setTexts(choreLI, {
            ".chore-name": count.choreName,
            ".total-count .num": count.memberCounts.reduce((acc, val) => acc + val.total, 0)
        });

        const choreDetailsUL = choreLI.querySelector(":scope > ul")!;
        const choreDetailsLITemplate = choreDetailsUL.querySelector(
            "template"
        ) as HTMLTemplateElement;

        const choreDetailsLIs = count.memberCounts.map(memberCount => {
            const clone = choreDetailsLITemplate.content.cloneNode(true) as DocumentFragment;
            const choreDetailsLI = clone.firstElementChild as HTMLLIElement;
            setTexts(choreDetailsLI, {
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
        const choreItem = li.querySelector("div.chore")!;
        const editButton = choreItem.querySelector("button.edit")!;
        const icon = editButton.querySelector("md-icon")!;
        const label = editButton.querySelector("span")!;

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
                const numInput = dli.querySelector("num-input")!;
                const numText = dli.querySelector(".count-text .num")!;
                const value = parseInt(numText.textContent);
                if (!isNaN(value)) numInput.value = value;
            });
        }
    };

    const toggleCollapse = (li: HTMLLIElement, collapse?: boolean) => {
        const detailsList = li.querySelector("ul.details") as HTMLUListElement;
        const icon = li.querySelector(".chore .expand md-icon")!;
        collapse ??= detailsList.inert;
        detailsList.toggleAttribute("inert", !collapse);
        icon.textContent = `keyboard_arrow_${detailsList.inert ? "down" : "up"}`;
        if (collapse) li.toggleAttribute("data-edit-mode", false);
        refreshEditState(li);
    };

    const evalTotal = (choreLi: HTMLLIElement) => {
        const totalCount = choreLi.querySelector(
            ".chore .total-count .num"
        ) as HTMLSpanElement;
        const counts = choreLi.querySelectorAll(
            ".count-text .num"
        ) as NodeListOf<HTMLSpanElement>;
        totalCount.textContent = [...counts]
            .reduce((acc, val) => acc + parseInt(val.textContent), 0)
            .toString();
    };

    const refreshExpandAllButtonState = (collapse?: boolean) => {
        const icon = expandAllButton.querySelector("md-icon") as MdIcon;
        const label = expandAllButton.querySelector("span") as HTMLSpanElement;
        if (!detailsLists.every(ul => ul?.hasAttribute("inert")) && (collapse ?? true)) {
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
            const label = expandAllButton.querySelector("span") as HTMLSpanElement;
            listItems.forEach(li => toggleCollapse(li, label.textContent == "Expand all"));
            refreshExpandAllButtonState();
        },
        { signal: controller.signal }
    );

    const changeNum = (
        newNum: number,
        detailsListItem: HTMLLIElement,
        listItem: HTMLLIElement
    ) => {
        const numInput = detailsListItem.querySelector("num-input") as NumInput;
        const numText = detailsListItem.querySelector(".count-text .num") as HTMLSpanElement;
        const offset = detailsListItem.querySelector(".offset") as HTMLSpanElement;
        const offsetNum = detailsListItem.querySelector(".offset .num") as HTMLSpanElement;

        const oldNum = parseInt(numText.textContent);
        const newNumInt: number = parseInt(newNum.toString());
        if (Math.abs(newNumInt) > 100_000 || isNaN(newNumInt)) {
            numInput.value = oldNum;
            return;
        }

        const difference = newNumInt - parseInt(numText.textContent);
        numInput.value = newNum;
        numText.textContent = newNum.toString();
        evalTotal(listItem);
        const newOffset =
            parseInt(offsetNum.textContent == "" ? "0" : offsetNum.textContent) + difference;
        offset.style.display = newOffset == 0 ? "none" : "";
        if (newOffset > 0) offsetNum.textContent = `+${newOffset}`;
        else offsetNum.textContent = newOffset.toString();
    };

    const getUiCount = (li: HTMLLIElement): UiCount | null => {
        const detailsListItems = li.querySelectorAll(
            "ul.details > li"
        ) as NodeListOf<HTMLLIElement>;

        const choreName = li.querySelector(".chore .chore-name")?.textContent;
        if (!choreName) return null;
        return {
            choreName: choreName,
            memberCounts: [...detailsListItems].map(dli => {
                let total = parseInt(
                    (dli.querySelector(".count-text .num") as HTMLSpanElement).textContent
                );
                let offset = parseInt(
                    (dli.querySelector(".offset .num") as HTMLSpanElement).textContent
                );
                total = isNaN(total) ? 0 : total;
                offset = isNaN(offset) ? 0 : offset;
                return {
                    memberName: (dli.querySelector(".member-name") as HTMLSpanElement)
                        .textContent,
                    total: total,
                    offset: offset
                };
            })
        };
    };

    const setUiCount = async (li: HTMLLIElement) => {
        const uiCount = getUiCount(li);
        if (uiCount) await Db.setCount(uiCount);
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

        choreItem.addEventListener(
            "click",
            () => {
                toggleCollapse(li);
                refreshExpandAllButtonState();
            },
            { signal: controller.signal }
        );
        editButton.addEventListener(
            "click",
            async e => {
                e.stopPropagation();
                li.toggleAttribute("data-edit-mode");
                if (!li.hasAttribute("data-edit-mode")) setUiCount(li);
                refreshEditState(li);
            },
            { signal: controller.signal }
        );

        const detailsListItems = li.querySelectorAll(
            "ul.details > li"
        ) as NodeListOf<HTMLLIElement>;
        detailsListItems.forEach(dli => {
            const numInput = dli.querySelector("num-input") as NumInput;
            const numText = dli.querySelector(".count-text .num") as HTMLSpanElement;

            numInput.value = parseInt(numText.textContent);

            numInput.addEventListener("input", () => changeNum(numInput.value, dli, li), {
                signal: controller.signal
            });

            numInput.addEventListener(
                "keydown",
                e => {
                    if (e.key == "Enter") {
                        li.toggleAttribute("data-edit-mode", false);
                        setUiCount(li);
                        refreshEditState(li);
                    }
                },
                { signal: controller.signal }
            );
        });
    });

    section.addEventListener("close", () => refreshExpandAllButtonState(false), {
        signal: controller.signal
    });

    section.addEventListener("close", () => controller.abort(), { once: true });
});
