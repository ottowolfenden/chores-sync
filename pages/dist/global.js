import { get } from "./modules/neon.js";
import { startAnim, stopAnim } from "./modules/sync-button.js";
const sync = async () => {
    startAnim();
    await get();
    stopAnim();
};
document.querySelector("button#sync")?.addEventListener("click", sync);
await sync();
//# sourceMappingURL=global.js.map