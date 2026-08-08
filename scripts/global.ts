import { get } from "./modules/jsonbin.js";
import { startAnim, stopAnim } from "./modules/sync-button.js";

document.querySelector("button#sync")?.addEventListener("click", async () => {
    startAnim();
    await get();
    stopAnim();
});
