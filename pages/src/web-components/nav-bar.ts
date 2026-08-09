export class NavBar extends HTMLElement {
    connectedCallback() {
        const pages = [
            { name: "Today", icon: "today", href: "today.html" },
            { name: "History", icon: "history", href: "history.html" },
            { name: "Count", icon: "bar_chart", href: "count.html" },
            { name: "Settings", icon: "settings", href: "settings.html" }
        ];
        this.innerHTML = `
            <nav>
                ${pages.reduce(
                    (acc, page) =>
                        acc +
                        `<a href="${page.href}">
                            <span class="icon">${page.icon}</span>
                            <span class="label">${page.name}</span>
                        </a>`,
                    ""
                )}
            </nav>
        `;
    }
}

customElements.define("nav-bar", NavBar);

declare global {
    interface HTMLElementTagNameMap {
        "nav-bar": NavBar;
    }
}
