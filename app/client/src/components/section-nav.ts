import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

@customElement("section-nav")
export class SectionNav extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String }) activeHash = location.hash || "#today";
    private readonly sections = [
        { name: "Today", icon: "today", fragment: "#today" },
        { name: "Timeline", icon: "timeline", fragment: "#timeline" },
        { name: "Count", icon: "bar_chart", fragment: "#count" },
        { name: "Settings", icon: "settings", fragment: "#settings" }
    ];

    render = () =>
        repeat(
            this.sections,
            s => s.fragment,
            s => html`
                <button
                    href=${s.fragment}
                    @click=${() => (location.hash = s.fragment)}
                    ?data-active=${this.activeHash == s.fragment}
                    tabindex=${this.activeHash == s.fragment ? -1 : 0}>
                    <md-icon>${s.icon}</md-icon>
                    <span>${s.name}</span>
                </button>
            `
        );
}
