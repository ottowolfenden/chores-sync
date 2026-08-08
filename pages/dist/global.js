import { checkSecret } from "./modules/cloudflare.js";
console.log(location);
if (!["/pages/index.html", "/"].includes(location.pathname) && !(await checkSecret()))
    location.replace("index.html");
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