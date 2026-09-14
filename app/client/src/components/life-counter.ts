import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("life-counter")
export class LifeCounter extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Number, attribute: "max-lives" }) maxLives = 3;
    @property({ type: Number }) lives = this.maxLives;
    @property({ type: Number }) size = 23;
    @property({ type: Boolean }) shake = false;

    render = () =>
        Array.from(
            { length: this.maxLives },
            (_, i) => html`
                <md-icon
                    class=${i < this.lives ? "life" : "lost-life"}
                    ?shake=${i < this.lives && this.shake}
                    style="--opsz: ${this.size}">
                    ${i < this.lives ? "favorite" : "heart_broken"}
                </md-icon>
            `
        );
}
