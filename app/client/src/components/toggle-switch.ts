import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("toggle-switch")
export class ToggleSwitch extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Boolean, reflect: true }) on = false;
    @property({ type: String }) text?: string;

    render = () => html`
        <label>
            ${this.text ? html`<span>${this.text}</span>` : ""}
            <div class="toggle">
                <div class="handle"><md-icon>${this.on ? "check" : "close"}</md-icon></div>
                <input
                    type="checkbox"
                    .checked=${this.on}
                    @change=${(e: Event) =>
                        (this.on = (e.target as HTMLInputElement).checked)} />
            </div>
        </label>
    `;
}
