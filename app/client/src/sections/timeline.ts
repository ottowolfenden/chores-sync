import "../components/timeline-list.js";

const section = document.querySelector("section#timeline")!;

const ui = {
    timelineList: section.querySelector("timeline-list")!,
    recentreButton: section.querySelector<HTMLButtonElement>("#recentre")!,
    selectDateButton: section.querySelector("#select-date")!
};

section.addEventListener("open", () => {
    onresize = () => ui.timelineList.reset();
    ui.recentreButton.onclick = () => ui.timelineList.scrollToDate({ expand: true });
    ui.timelineList.reset({ collapseAll: true });

    (section as HTMLElement & { onclose: () => void }).onclose = () => console.log("hello");
});

section.addEventListener("close", () => ui.timelineList.reset({ collapseAll: true }));
