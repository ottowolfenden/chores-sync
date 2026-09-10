import "../components/easter-egg-game";

const section = document.querySelector("section#easter-egg")!;

section.addEventListener("sectionopen", () => console.log("easter egg opened"));
section.addEventListener("sectionclose", () => console.log("easter egg closed"));
