import { checkSecret } from "./modules/cloudflare.js";
const isLoginPage = ["/pages/index.html", "/"].includes(location.pathname);
if (!isLoginPage && (!(await checkSecret()) || !localStorage.getItem("name")))
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
