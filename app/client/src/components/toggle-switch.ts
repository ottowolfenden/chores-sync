import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("toggle-switch")
export class ToggleSwitch extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Boolean, reflect: true }) on = false;
    @property({ type: Boolean, reflect: true }) disabled = false;
    @property({ type: String }) text?: string;

    private handleChange = (e: Event) => {
        e.stopPropagation();
        this.on = (e.target as HTMLInputElement).checked;
        this.dispatchEvent(new CustomEvent("change", { detail: { on: this.on } }));
    };

    render = () => html`
        <label>
            ${this.text ? html`<span>${this.text}</span>` : ""}
            <div class="toggle">
                <div class="handle"><md-icon>${this.on ? "check" : "close"}</md-icon></div>
                <input
                    type="checkbox"
                    .checked=${this.on}
                    ?disabled=${this.disabled}
                    ?inert=${this.disabled}
                    @change=${this.handleChange} />
            </div>
        </label>
    `;
}
