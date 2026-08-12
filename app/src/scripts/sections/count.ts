const section = document.querySelector("section#count")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    section.addEventListener("close", () => controller.abort(), { once: true });
});
