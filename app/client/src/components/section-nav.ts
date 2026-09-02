import { LitElement, html, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addHaptics } from "../functions/haptics";

@customElement("section-nav")
export class SectionNav extends LitElement {
    protected createRenderRoot = () => this;

    @state() private activeHash = window.location.hash || "#today";

    protected update(changed: PropertyValues) {
        super.update(changed);
        addHaptics("button", this);
    }

    private readonly sections = [
        { name: "Today", icon: "today", fragment: "#today" },
        { name: "Timeline", icon: "timeline", fragment: "#timeline" },
        { name: "Count", icon: "bar_chart", fragment: "#count" },
        { name: "Settings", icon: "settings", fragment: "#settings" }
    ];
    private readonly handleHashChange = () =>
        (this.activeHash = window.location.hash || "#today");

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
                    @click=${() => (window.location.hash = s.fragment)}
                    ?data-active=${this.activeHash == s.fragment}
                    tabindex=${this.activeHash == s.fragment ? -1 : 0}>
                    <md-icon>${s.icon}</md-icon>
                    <span>${s.name}</span>
                </button>
            `
        );
}
