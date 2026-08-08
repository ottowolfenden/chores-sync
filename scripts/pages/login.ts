const form = document.querySelector("form");

form?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const name = data.get("name") as string;
    const accessKey = data.get("access-key") as string;

    if (!name || !accessKey) return;

    localStorage.setItem("name", name);
    localStorage.setItem("access-key", accessKey);
    location.replace("../index.html");
});
