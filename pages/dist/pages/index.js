import { checkSecret } from "../modules/cloudflare.js";
if ((await checkSecret()) && localStorage.getItem("name"))
    location.replace("today.html");
const showInvalid = (inputName) => {
    const input = document.querySelector(`form input[name="${inputName}"]`);
    if (!(input instanceof HTMLInputElement))
        return;
    input.setAttribute("data-invalid", "");
    input.addEventListener("input", () => input.removeAttribute("data-invalid"));
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
    if (await checkSecret(guess)) {
        localStorage.setItem("name", name);
        localStorage.setItem("login-secret", guess);
        location.replace("today.html");
    }
    else
        showInvalid("login-secret");
});
//# sourceMappingURL=index.js.map