document.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const loginSecret = data.get("login-secret");
    if (!name || !loginSecret)
        return;
    localStorage.setItem("name", name);
    localStorage.setItem("login-secret", loginSecret);
    const response = await fetch("/api/test", {
        headers: { "X-Login-Secret": loginSecret }
    });
    if (response.status == 401) {
        localStorage.removeItem("name");
        localStorage.removeItem("login-secret");
        return;
    }
    if (response.status != 200)
        console.log("error");
    else
        location.replace("today.html");
});
export {};
//# sourceMappingURL=index.js.map