const section = document.querySelector("section#history")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    section.addEventListener("close", () => controller.abort(), { once: true });
});
