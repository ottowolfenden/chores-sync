const section = document.querySelector("section#settings")!;

section.addEventListener("open", () => {
    const controller = new AbortController();

    section.addEventListener("close", () => controller.abort(), { once: true });
});
