export const route = async () => {
    document.querySelectorAll("section").forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("sectionclose"));
        const isTarget = s.id == location.hash.replace("#", "");
        if (isTarget) s.dispatchEvent(new CustomEvent("sectionopen"));
        s.hidden = !isTarget;
        document.querySelector("main")?.scroll(0, 0);
    });
};

export const refresh = () => {
    const section = [...document.querySelectorAll("section")].find(
        s => s.id == location.hash.replace("#", "")
    );
    section?.dispatchEvent(new CustomEvent("sectionclose"));
    section?.dispatchEvent(new CustomEvent("sectionopen"));
};
