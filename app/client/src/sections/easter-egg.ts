import { Cache } from "../classes/cache";
import "../components/easter-egg-game";

const section = document.querySelector("section#easter-egg")!;
const game = section.querySelector("easter-egg-game")!;

section.addEventListener("sectionopen", async () => {
    document.fonts.load(`400 1em "Material Symbols Outlined Easter Egg"`);
    const message = game.querySelector("status-message")!;
    message.elsToHide = [game.querySelector(".leaderboard")];
    message.status = "loading";
    game.members = await Cache.members.get();
    message.status =
        game.members === null ? "error" : game.members.length == 0 ? "empty" : "success";
    game.currentMember = await Cache.currentMember.get();
});

section.addEventListener("sectionclose", () => {
    game.reset();
    Cache.members.invalidate();
    Cache.currentMember.invalidate();
});
