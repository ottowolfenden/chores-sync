const form = document.querySelector("form");
form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const loginSecret = data.get("login-secret");
    if (!name || !loginSecret)
        return;
    localStorage.setItem("name", name);
    localStorage.setItem("login-secret", loginSecret);
    const response = await fetch("/api/test", {
        headers: { Authorization: `Bearer ${loginSecret}` }
    });
    if (response.status == 401) {
        localStorage.removeItem("name");
        localStorage.removeItem("login-secret");
        return;
    }
});
export {};
//# sourceMappingURL=login.js.map