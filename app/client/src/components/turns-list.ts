import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addHaptics } from "../functions/haptics.js";

@customElement("turns-list")
export class TurnsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) turns: UiTurn[] = [];

    protected update(changed: PropertyValues) {
        super.update(changed);
        addHaptics("button");
    }

    render = () =>
        repeat(
            this.turns,
            t => t.chore.id,
            t => html`
                <div>
                    <span class="chore-name">${t.chore.name}</span>
                    <span class="member-name">${t.member.name}</span>
                    <button class="transparent small" @click=${() => console.log(t)}>
                        <md-icon>add</md-icon>
                    </button>
                </div>
            `
        );
}
