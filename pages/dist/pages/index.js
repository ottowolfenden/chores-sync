const checkSecret = async (loginSecret) => (await fetch("/api/dist/check-secret", {
    headers: { "X-Login-Secret": loginSecret }
})).status == 200;
const loginSecret = localStorage.getItem("login-secret");
if (loginSecret && (await checkSecret(loginSecret)))
    location.replace("today.html");
document.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const loginSecret = data.get("login-secret");
    if (await checkSecret(loginSecret)) {
        localStorage.setItem("name", name);
        localStorage.setItem("login-secret", loginSecret);
        location.replace("today.html");
    }
    else
        console.log("incorrect");
});
export {};
//# sourceMappingURL=index.js.map