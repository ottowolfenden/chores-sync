import fs from "node:fs";

const api = "https://fonts.googleapis.com/css2";
const userAgent = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
};

await Promise.all(
    JSON.parse(fs.readFileSync("app/client/src/assets/material-symbols.json")).map(
        async obj => {
            const icons = [...new Set(obj.icons)].join(",");
            const cssUrl = `${api}?family=Material+Symbols+Outlined:${obj.config}&icon_names=${icons}`;
            const css = await fetch(cssUrl, { headers: userAgent }).then(r => r.text());
            const start = css.indexOf("url(") + 4;
            const end = css.indexOf(")", start);
            const fontUrl = css.substring(start, end);
            const font = await fetch(fontUrl).then(r => r.arrayBuffer());
            fs.writeFileSync(obj.path, Buffer.from(font));
        }
    )
)
    .then(() => console.log("successfully downloaded material symbols"))
    .catch(err => console.error(`failed to download material symbols\n${err}`));
