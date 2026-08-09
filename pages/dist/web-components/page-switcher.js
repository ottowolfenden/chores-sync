export class PageSwitcher extends HTMLElement {
    button;
    connectedCallback() {
        const pages = [
            "/pages/today.html",
            "/pages/history.html",
            "/pages/count.html",
            "/pages/settings.html"
        ];
        this.innerHTML = `
            
        `;
        this.button = this.querySelector("button");
    }
}
customElements.define("page-switcher", PageSwitcher);
//# sourceMappingURL=page-switcher.js.map