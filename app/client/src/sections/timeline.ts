import "../components/timeline-list.js";

const section = document.querySelector("section#timeline")!;

section.addEventListener("open", () => {
    const ui = {
        timelineList: section.querySelector("timeline-list")!,
        recentreButton: section.querySelector("#recentre")!,
        selectDateButton: section.querySelector("#select-date")!
    };

    const recentre = () => ui.timelineList.scrollToDate();
    ui.recentreButton.addEventListener("click", recentre);

    section.addEventListener(
        "close",
        () => {
            ui.recentreButton.removeEventListener("click", recentre);
        },
        { once: true }
    );
});
