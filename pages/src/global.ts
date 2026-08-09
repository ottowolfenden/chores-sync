import { checkSecret } from "./modules/cloudflare.js";
const isLoginPage = ["/pages/index.html", "/"].includes(location.pathname);
if (!isLoginPage && (!(await checkSecret()) || !localStorage.getItem("name")))
    location.replace("index.html");

import { get } from "./modules/neon.js";
import "./web-components/sync-button.js";

const syncButton = document.querySelector("sync-button");
syncButton?.addEventListener("click", async () => {
    syncButton.syncing = true;
    await get();
    syncButton.syncing = false;
});
syncButton?.click();
