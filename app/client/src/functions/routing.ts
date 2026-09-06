export const route = async () => {
    document.querySelectorAll("section").forEach(s => {
        if (!s.hidden) s.dispatchEvent(new CustomEvent("close"));
        const isTarget = s.id == location.hash.replace("#", "");
        if (isTarget) s.dispatchEvent(new CustomEvent("open"));
        s.hidden = !isTarget;
        document.querySelector("main")?.scroll(0, 0);
    });
};

export const refresh = () => {
    const sectionEl = [...document.querySelectorAll("section")].find(
        s => s.id == location.hash.replace("#", "")
    );
    sectionEl?.dispatchEvent(new CustomEvent("close"));
    sectionEl?.dispatchEvent(new CustomEvent("open"));
};
