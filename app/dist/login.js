import { checkAccess } from "./services/cloudflare.js";
if (await checkAccess())
    location.replace("index.html#today");
const showInvalid = (inputName) => {
    const input = document.querySelector(`form input[name="${inputName}"]`);
    if (!(input instanceof HTMLInputElement))
        return;
    input.toggleAttribute("data-invalid", true);
    input.addEventListener("input", () => input.toggleAttribute("data-invalid", false));
};
document.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const guess = data.get("login-secret");
    if (!name)
        showInvalid("name");
    if (!guess)
        showInvalid("login-secret");
    if (!name || !guess)
        return;
    if (await checkAccess(guess, false)) {
        localStorage.setItem("name", name);
        localStorage.setItem("login-secret", guess);
        location.replace("index.html#today");
    }
    else
        showInvalid("login-secret");
});
//# sourceMappingURL=login.js.map