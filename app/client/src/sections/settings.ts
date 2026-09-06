const section = document.querySelector("section#settings")!;

section.addEventListener("sectionopen", () => console.log("settings opened"));
section.addEventListener("sectionclose", () => console.log("settings closed"));
