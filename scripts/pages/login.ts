if (localStorage.getItem("login-secret") && localStorage.getItem("name"))
    location.replace("today.html");

const form = document.querySelector("form");

form?.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name") as string;
    const loginSecret = data.get("login-secret") as string;

    if (!name || !loginSecret) return;

    localStorage.setItem("name", name);
    localStorage.setItem("login-secret", loginSecret);

    const response = await fetch("/api/data", {
        headers: { Authorization: `Bearer ${loginSecret}` }
    });

    if (response.status == 401) {
        localStorage.removeItem("login-secret");
        return;
    }

    location.replace("../index.html");
});
