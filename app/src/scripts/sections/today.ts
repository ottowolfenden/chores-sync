const section = document.querySelector("section#today")!;

section.addEventListener("open", () => {
    console.log("today");

    const checkboxes = section.querySelectorAll(
        "#your-chores input[type='checkbox']"
    ) as NodeListOf<HTMLInputElement>;

    const dismissAllButton = section.querySelector(
        "button#dismiss-all"
    ) as HTMLButtonElement;

    checkboxes.forEach(c =>
        c.addEventListener("change", () => {
            if ([...checkboxes].every(c => c.checked)) dismissAllButton.disabled = true;
            else dismissAllButton.disabled = false;
        })
    );

    dismissAllButton.addEventListener("click", () => {
        checkboxes.forEach(c => ((c as HTMLInputElement).checked = true));
        setTimeout(
            () => (dismissAllButton.disabled = true),
            parseFloat(getComputedStyle(dismissAllButton).transitionDuration) * 1000
        );
    });
});
