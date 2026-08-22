const section = document.querySelector("section#settings")!;

section.addEventListener("open", () => {
    section.addEventListener("close", () => {}, { once: true });
    console.log("settings");
});
