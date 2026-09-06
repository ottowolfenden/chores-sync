import "../components/timeline-list.js";

const section = document.querySelector("section#timeline")!;

section.addEventListener("open", () => {
    const ui = {
        timelineList: section.querySelector("timeline-list")!,
        recentreButton: section.querySelector("#recentre")!,
        selectDateButton: section.querySelector("#select-date")!
    };

    window.addEventListener("resize", ui.timelineList.reset);
    ui.recentreButton.addEventListener("click", ui.timelineList.recentre);
    ui.timelineList.reset();

    section.addEventListener(
        "close",
        () => {
            window.removeEventListener("resize", ui.timelineList.reset);
            ui.recentreButton.removeEventListener("click", ui.timelineList.recentre);
            ui.timelineList.reset();
        },
        { once: true }
    );
});
