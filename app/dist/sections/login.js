import { checkAccess } from "../services/cloudflare.js";
const login = document.querySelector("section#login");
login.addEventListener("open", async () => {
    console.log("login");
    const access = await checkAccess();
    console.log("outer");
    if (access)
        location.replace("#today");
    const showInvalid = (inputName) => {
        const input = login.querySelector(`form input[name="${inputName}"]`);
        if (!(input instanceof HTMLInputElement))
            return;
        input.toggleAttribute("data-invalid", true);
        input.addEventListener("input", () => input.toggleAttribute("data-invalid", false));
    };
    login.querySelector("form")?.addEventListener("submit", async (e) => {
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
            console.log("Here");
            localStorage.setItem("name", name);
            localStorage.setItem("login-secret", guess);
            location.replace("#today");
        }
        else
            showInvalid("login-secret");
    });
});
//# sourceMappingURL=login.js.map