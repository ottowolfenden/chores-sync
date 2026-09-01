const updateManifest = () =>
    document
        .querySelector(`link[rel="manifest"]`)
        ?.setAttribute(
            "href",
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "assets/site-dark.webmanifest"
                : "assets/site-light.webmanifest"
        );

updateManifest();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateManifest);
