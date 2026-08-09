export class PageSwitcher extends HTMLElement {
    private button!: HTMLButtonElement;

    connectedCallback() {
        const pages = [
            "/pages/today.html",
            "/pages/history.html",
            "/pages/count.html",
            "/pages/settings.html"
        ];
        this.innerHTML = `
            
        `;
        this.button = this.querySelector("button")!;
    }
}

customElements.define("page-switcher", PageSwitcher);

declare global {
    interface HTMLElementTagNameMap {
        "page-switcher": PageSwitcher;
    }
}
