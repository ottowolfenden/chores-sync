const section = document.querySelector("section#today")!;

section.addEventListener("open", () => {
    console.log("today");

    const disableAfterTransition = (button: HTMLButtonElement) => {
        const duration: string = getComputedStyle(button).transitionDuration;
        setTimeout(
            () => (button.disabled = true),
            parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000)
        );
    };

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
                    e.newState == "open" ? "arrow_drop_up" : "arrow_drop_down")
        );
    });
});
