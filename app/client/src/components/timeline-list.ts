import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("timeline-list")
export class TimelineList extends LitElement {
    protected createRenderRoot = () => this;

    render = () => html``;
}
