export class SyncButton extends HTMLElement {
    private button!: HTMLButtonElement;

    connectedCallback() {
        this.innerHTML = `
            <button class="filled">
                <span class="icon">sync</span>
                <span class="label">Sync</span>
            </button>
        `;
        this.button = this.querySelector("button")!;
    }

    get syncing(): boolean {
        return this.button.disabled;
    }
    set syncing(value: boolean) {
        this.button.disabled = value;
        const label = this.button.querySelector(".label") as HTMLSpanElement;
        if (value) {
            this.setAttribute("data-syncing", "");
            label.textContent = "Syncing";
        } else {
            this.removeAttribute("data-syncing");
            label.textContent = "Sync";
        }
    }
}

customElements.define("sync-button", SyncButton);

declare global {
    interface HTMLElementTagNameMap {
        "sync-button": SyncButton;
    }
}
