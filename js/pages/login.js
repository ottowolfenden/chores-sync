if (localStorage.getItem("access-key") && localStorage.getItem("name"))
    location.replace("today.html");
const form = document.querySelector("form");
form?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const accessKey = data.get("access-key");
    if (!name || !accessKey)
        return;
    localStorage.setItem("name", name);
    localStorage.setItem("access-key", accessKey);
    location.replace("../index.html");
});
export {};
//# sourceMappingURL=login.js.map