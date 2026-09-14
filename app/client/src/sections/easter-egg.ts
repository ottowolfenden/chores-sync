import { Cache } from "../classes/cache";
import "../components/easter-egg-game";

const section = document.querySelector("section#easter-egg")!;
const game = section.querySelector("easter-egg-game")!;

section.addEventListener("sectionopen", async () => {
    document.fonts.load(`400 1em "Material Symbols Outlined Easter Egg"`);
    game.currentMember = await Cache.currentMember.get();
});
section.addEventListener("sectionclose", () => {
    game.reset();
    Cache.currentMember.invalidate();
    Cache.members.invalidate();
});
