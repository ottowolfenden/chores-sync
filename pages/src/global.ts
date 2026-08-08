import { checkSecret } from "./modules/cloudflare.js";
if (location.pathname != "/pages/index.html" && !(await checkSecret()))
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
