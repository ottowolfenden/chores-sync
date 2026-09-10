const sections = [...document.querySelectorAll("section")];

export const route = async () => {
    if (!sections.map(s => `#${s.id}`).includes(location.hash)) location.hash = "#today";
    sections.forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("sectionclose"));
        const isTarget = s.id == location.hash.replace("#", "");
        if (isTarget) s.dispatchEvent(new CustomEvent("sectionopen"));
        s.hidden = !isTarget;
        document.querySelector("main")?.scroll(0, 0);
    });
};

export const refresh = () => {
    const section = sections.find(s => s.id == location.hash.replace("#", ""));
    section?.dispatchEvent(new CustomEvent("sectionclose"));
    section?.dispatchEvent(new CustomEvent("sectionopen"));
};
