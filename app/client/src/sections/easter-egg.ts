import { Cache } from "../classes/cache";
import "../components/easter-egg-game";

const section = document.querySelector("section#easter-egg")!;
const message = section.querySelector("status-message")!;
const game = section.querySelector("easter-egg-game")!;

message.elsToHide = [game];

section.addEventListener("sectionopen", async () => {
    message.status = "loading";
    game.message = message;
    await document.fonts
        .load(`400 1em "Material Symbols Outlined Easter Egg"`)
        .then(() => (message.status = "success"))
        .catch(() => (message.status = "error"));
    game.start();
    game.currentMember = await Cache.currentMember.get();
});

section.addEventListener("sectionclose", async () => await game.reset());
