import { get } from "./modules/neon.js";
import { startAnim, stopAnim } from "./modules/sync-button.js";
const button = document.querySelector("button#sync");
if (button instanceof HTMLButtonElement) {
    button.addEventListener("click", async () => {
        startAnim();
        await get();
        stopAnim();
    });
    button.click();
}
//# sourceMappingURL=global.js.map