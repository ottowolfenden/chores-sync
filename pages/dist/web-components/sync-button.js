export class SyncButton extends HTMLElement {
    button;
    connectedCallback() {
        this.innerHTML = `
            <button class="filled">
                <span class="icon">sync</span>
                <span class="label">Sync</span>
            </button>
        `;
        this.button = this.querySelector("button");
    }
    get syncing() {
        return this.button.disabled;
    }
    set syncing(value) {
        this.button.disabled = value;
        const label = this.button.querySelector(".label");
        if (value) {
            this.setAttribute("data-syncing", "");
            label.textContent = "Syncing";
        }
        else {
            this.removeAttribute("data-syncing");
            label.textContent = "Sync";
        }
    }
}
customElements.define("sync-button", SyncButton);
//# sourceMappingURL=sync-button.js.map