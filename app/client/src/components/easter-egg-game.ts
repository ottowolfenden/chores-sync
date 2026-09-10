import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    render = () => html`
        <div class="stats"></div>
        <div class="container">
            <md-icon class="player">directions_bike</md-icon>
        </div>
    `;
}
