import fs from "node:fs";

const outDir = "app/client/src/assets/fonts/";
const userAgent = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
};

const download = async icons => {
    const cssUrl =
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:" +
        `opsz,wght,FILL@20..48,100..700,0..1&icon_names=${icons}`;
    const css = await fetch(cssUrl, { headers: userAgent }).then(r => r.text());
    const start = css.indexOf("url(") + 4;
    const end = css.indexOf(")", start);
    const fontUrl = css.substring(start, end);
    return fetch(fontUrl).then(r => r.arrayBuffer());
};

const write = async (name, font) => fs.writeFileSync(outDir + name, Buffer.from(await font));

try {
    const [main, easterEgg] = fs
        .readFileSync("material-symbols.txt", "utf-8")
        .split("EASTER EGG ICONS")
        .map(l => download([...new Set(l.trim().split(/\s+/))].sort()));
    await write("material-symbols.woff2", main);
    await write("material-symbols-easter-egg.woff2", easterEgg);
    console.log("successfully downloaded material symbols");
} catch (err) {
    console.error(`failed to download material symbols\n${err}`);
}
