document.querySelector("section#today")?.addEventListener("open", () => {
    console.log("today");

    const checkboxes = document.querySelectorAll(
        "#your-chores input[type='checkbox']"
    ) as NodeListOf<HTMLInputElement>;

    const dismissAllButton = document.querySelector(
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
        dismissAllButton.disabled = true;
    });
});
