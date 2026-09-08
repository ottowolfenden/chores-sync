import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("md-icon")
export class MdIcon extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Boolean }) spin: boolean = false;

    setIcon = (icon: string) => (this.textContent = icon);

    render = () => html`<slot></slot>`;
}
