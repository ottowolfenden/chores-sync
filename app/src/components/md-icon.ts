import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("md-icon")
export class MdIcon extends LitElement {
    protected createRenderRoot = () => this;
    render = () => html`<slot></slot>`;
}
