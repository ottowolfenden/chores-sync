import { checkSecret } from "./modules/cloudflare.js";
console.log(location);
// if (!location.pathname.endsWith("/index.html") && !(await checkSecret()))
//     location.replace("index.html");

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
