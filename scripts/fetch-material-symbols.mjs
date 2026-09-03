import fs from "node:fs";

try {
    const icons = [
        ...new Set(fs.readFileSync("material-symbols.txt", "utf-8").trim().split(/\s+/).sort())
    ].join(",");
    const cssUrl =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:" +
        `opsz,wght,FILL@20..48,100..700,0..1&icon_names=${icons}`;

    console.log("downloading material symbols");
    const css = await fetch(cssUrl, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
        }
    }).then(r => r.text());

    const start = css.indexOf("url(") + 4;
    const end = css.indexOf(")", start);
    const fontUrl = css.substring(start, end);
    const font = await fetch(fontUrl).then(r => r.arrayBuffer());

    fs.writeFileSync("app/client/src/assets/fonts/material-symbols.woff2", Buffer.from(font));

    console.log("successfully downloaded material symbols");
} catch (err) {
    console.error(`failed to download material symbols\n${err}`);
}
