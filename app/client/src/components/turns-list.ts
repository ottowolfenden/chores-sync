import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addAssignment } from "../functions/db";

@customElement("turns-list")
export class TurnsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) turns: UiTurn[] = [];

    render = () =>
        repeat(
            this.turns,
            t => t.chore.id,
            t => html`
                <div>
                    <span class="chore-name">${t.chore.name}</span>
                    <span class="member-name">${t.member.name}</span>
                    <state-actions
                        .conf=${{
                            normal: {
                                icon: "add",
                                click: async () =>
                                    await addAssignment({
                                        uuid: crypto.randomUUID(),
                                        date: new Date(),
                                        quantity: 1,
                                        chore: t.chore,
                                        turnMember: t.member,
                                        chosenMember: t.member
                                    })
                            },
                            loading: {},
                            success: {},
                            error: { msToShow: 2000 }
                        }}
                        state-button-class="transparent small">
                    </state-actions>
                </div>
            `
        );
}
