const section = document.querySelector("section#timeline")!;

section.addEventListener("open", () => {
    section.addEventListener("close", () => {}, { once: true });
    console.log("timeline");
});
