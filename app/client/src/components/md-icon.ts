import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("md-icon")
export class MdIcon extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Boolean, attribute: "spin" }) spin: boolean = false;

    render = () => html`<slot></slot>`;
}
