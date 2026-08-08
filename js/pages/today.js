if (!localStorage.getItem("access-key") || !localStorage.getItem("name"))
    location.replace("login.html");
import { get } from "../modules/jsonbin.js";
document.getElementById("button")?.addEventListener("click", () => get());
//# sourceMappingURL=today.js.map