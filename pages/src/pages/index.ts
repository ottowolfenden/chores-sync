const checkSecret = async (loginSecret: string): Promise<boolean> =>
    (
        await fetch("/api/dist/check-secret", {
            headers: { "X-Login-Secret": loginSecret }
        })
    ).status == 200;

const loginSecret = localStorage.getItem("login-secret");
if (loginSecret && (await checkSecret(loginSecret))) location.replace("today.html");

document.querySelector("form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name") as string;
    const loginSecret = data.get("login-secret") as string;

    if (await checkSecret(loginSecret)) {
        localStorage.setItem("name", name);
        localStorage.setItem("login-secret", loginSecret);
        location.replace("today.html");
    } else {
        const input = document.querySelector(
            "input[name='login-secret']"
        ) as HTMLInputElement;
        input.setAttribute("data-invalid", "");
        input.addEventListener("keydown", () => input.removeAttribute("data-invalid"));
    }
});
