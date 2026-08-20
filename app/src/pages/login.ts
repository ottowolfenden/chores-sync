import { checkAccess } from "../services/cloudflare.js";

if (await checkAccess()) location.replace("index.html#today");

const showInvalid = (inputName: string) => {
    const input = document.querySelector(`form input[name="${inputName}"]`);
    if (!(input instanceof HTMLInputElement)) return;
    input.toggleAttribute("data-invalid", true);
    input.addEventListener("input", () => input.toggleAttribute("data-invalid", false));
};

document.querySelector("form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name") as string;
    const guess = data.get("secret") as string;

    if (!name) showInvalid("name");
    if (!guess) showInvalid("secret");
    if (!name || !guess) return;

    if (await checkAccess(guess, false)) {
        localStorage.setItem("name", name);
        localStorage.setItem("secret", guess);
        location.replace("index.html#today");
    } else showInvalid("secret");
});
