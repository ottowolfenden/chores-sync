const form = document.querySelector("form");

form.addEventListener("submit", e => {
    e.preventDefault();
    localStorage.setItem("name", form.elements["name"].value);
    localStorage.setItem("access-key", form.elements["access-key"].value);
    location.replace("../index.html");
});
