import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

@customElement("section-nav")
export class SectionNav extends LitElement {
    protected createRenderRoot = () => this;

    @state() private activeHash = window.location.hash || "#today";

    private handleHashChange = () => (this.activeHash = window.location.hash || "#today");
    private open = (fragment: string) => (window.location.hash = fragment);
    private sections = [
        { name: "Today", icon: "today", fragment: "#today" },
        { name: "Timeline", icon: "timeline", fragment: "#timeline" },
        { name: "Count", icon: "bar_chart", fragment: "#count" },
        { name: "Settings", icon: "settings", fragment: "#settings" }
    ];

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("hashchange", this.handleHashChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("hashchange", this.handleHashChange);
    }

    render = () =>
        repeat(
            this.sections,
            s => s.fragment,
            s => html`
                <button
                    href=${s.fragment}
                    @click=${() => this.open(s.fragment)}
                    ?data-active=${this.activeHash == s.fragment}>
                    <md-icon>${s.icon}</md-icon>
                    <span>${s.name}</span>
                </button>
            `
        );
}
