import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("md-icon")
export class MdIcon extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Boolean }) fill = false;

    updated = () => this.style.setProperty("--fill", (this.fill ? 1 : 0).toString());
    setIcon = (icon: string) => (this.textContent = icon);
    render = () => html`<slot></slot>`;
}
