import "../components/easter-egg-game";

const section = document.querySelector("section#easter-egg")!;

section.addEventListener("sectionopen", () => {
    document.fonts.load(`400 1em "Material Symbols Outlined Easter Egg"`);
    // TEMPORARY
    section.querySelector("easter-egg-game")!.start();
});
section.addEventListener("sectionclose", () => {});
