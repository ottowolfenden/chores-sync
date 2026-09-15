import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../components/toggle-switch";

@customElement("members-list")
export class MembersList extends LitElement {
    protected createRenderRoot = () => this;

    render = () => html`members list`;
}
