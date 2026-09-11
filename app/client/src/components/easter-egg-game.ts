import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import data from "../assets/material-symbols.json";

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    connectedCallback(): void {
        console.log(data);
    }

    render = () => html`<md-icon>bathtub</md-icon>`;
}
