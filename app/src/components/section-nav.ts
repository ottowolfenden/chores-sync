import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("section-nav")
export class SectionNav extends LitElement {
    protected createRenderRoot = () => this;

    @state() private activeHash = window.location.hash || "#today";

    private handleHashChange = () => (this.activeHash = window.location.hash || "#today");
    private open = (fragment: string) => (window.location.hash = fragment);

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("hashchange", this.handleHashChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("hashchange", this.handleHashChange);
    }

    render = () =>
        [
            { name: "Today", icon: "today", fragment: "#today" },
            { name: "History", icon: "history", fragment: "#history" },
            { name: "Count", icon: "bar_chart", fragment: "#count" },
            { name: "Settings", icon: "settings", fragment: "#settings" }
        ].map(
            s => html`
                <button
                    href="${s.fragment}"
                    @click="${() => this.open(s.fragment)}"
                    ?data-active="${this.activeHash == s.fragment}">
                    <span class="icon">${s.icon}</span>
                    <span class="label">${s.name}</span>
                </button>
            `
        );
}
