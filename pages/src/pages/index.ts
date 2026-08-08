import { checkSecret } from "../modules/cloudflare.js";
if (await checkSecret()) location.replace("today.html");

const showInvalid = (inputName: string) => {
    const input = document.querySelector(
        `form input[name="${inputName}"]`
    ) as HTMLInputElement;
    input.setAttribute("data-invalid", "");
    input.addEventListener("keydown", () => input.removeAttribute("data-invalid"));
};

document.querySelector("form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name") as string;
    const guess = data.get("login-secret") as string;

    if (!name) showInvalid("name");
    if (!guess) showInvalid("login-secret");
    if (!name || !guess) return;

    if (await checkSecret(guess)) {
        localStorage.setItem("name", name);
        localStorage.setItem("login-secret", guess);
        location.replace("today.html");
    } else {
        const input = document.querySelector(
            "input[name='login-secret']"
        ) as HTMLInputElement;
        input.setAttribute("data-invalid", "");
        input.addEventListener("keydown", () => input.removeAttribute("data-invalid"));
    }
});
