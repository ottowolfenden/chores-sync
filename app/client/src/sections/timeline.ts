import "../components/timeline-list.js";

const section = document.querySelector("section#timeline")!;

const ui = {
    timelineList: section.querySelector("timeline-list")!,
    recentreButton: section.querySelector<HTMLButtonElement>("#recentre")!,
    selectDateButton: section.querySelector("#select-date")!
};

ui.recentreButton.onclick = () => ui.timelineList.scrollToDate({ expand: true });

section.addEventListener("sectionopen", () => ui.timelineList.reset({ collapseAll: true }));
section.addEventListener("sectionclose", () => ui.timelineList.reset({ collapseAll: true }));
