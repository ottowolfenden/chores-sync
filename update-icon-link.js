import fs from "node:fs";

const icons = [
    ...new Set(fs.readFileSync("icons.txt", "utf-8").trim().split(/\s+/).sort())
].join(",");
const link = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&icon_names=${icons}">`;

let html = fs.readFileSync("app/dist/index.html", "utf-8");
html = html.replace(`<link id="material-symbols" />`, link);

fs.writeFileSync("app/dist/index.html", html);
console.log(`added ${link}`);
