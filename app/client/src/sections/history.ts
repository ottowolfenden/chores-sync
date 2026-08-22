const section = document.querySelector("section#history")!;

section.addEventListener("open", () => {
    section.addEventListener("close", () => {}, { once: true });
    console.log("history");
});
