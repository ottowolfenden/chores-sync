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

    const refreshYourChoresState = () => {
        const checkboxes = section.querySelectorAll(
            "#your-chores input[type='checkbox']"
        ) as NodeListOf<HTMLInputElement>;
        const dismissAllButton = section.querySelector(
            "button#dismiss-all"
        ) as HTMLButtonElement;

        checkboxes.forEach(c =>
            c.addEventListener("change", () => {
                if ([...checkboxes].every(c => c.checked))
                    dismissAllButton.disabled = true;
                else dismissAllButton.disabled = false;
            })
        );
        dismissAllButton.addEventListener("click", () => {
            checkboxes.forEach(c => ((c as HTMLInputElement).checked = true));
            disableAfterTransition(dismissAllButton);
        });
    };
    const refreshAllChoresState = () => {
        const rows = section.querySelectorAll("#all-chores tr");
        rows.forEach(r => {
            const button = r.querySelector(".assignment button") as HTMLButtonElement;
            button?.addEventListener("click", () => {
                const icon = button.querySelector(".icon");
                const label = button.querySelector(".icon + span");
                if (icon) icon.textContent = "check";
                if (label) label.textContent = "Assigned";
                r.toggleAttribute("data-assigned", true);
                disableAfterTransition(button);
            });
        });
    };

    refreshYourChoresState();
    refreshAllChoresState();
});
