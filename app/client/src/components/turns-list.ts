import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addAssignment } from "../functions/db";
import { Context } from "../classes/context";
import { queryClosest } from "../functions/element-utils";
import { ref } from "lit/directives/ref.js";

@customElement("turns-list")
export class TurnsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) turns: UiTurn[] = [];
    @state() private members: UiMember[] = [];

    async connectedCallback() {
        super.connectedCallback();
        this.members = (await Context.members) ?? [];
    }

    private addAssignment = async (
        turn: UiTurn,
        chosenMember: UiMember = turn.member
    ): Promise<boolean> => {
        const assignment = {
            uuid: crypto.randomUUID(),
            date: new Date(),
            quantity: 1,
            chore: turn.chore,
            turnMember: turn.member,
            chosenMember: chosenMember
        };
        const success = await addAssignment(assignment);
        if (success)
            window.dispatchEvent(
                new CustomEvent("assignment-added", {
                    detail: { assignment }
                })
            );
        this.requestUpdate();
        return success;
    };

    render = () =>
        repeat(
            this.turns,
            t => t.chore.id,
            t => {
                let stateActions: StateActions;
                return html`
                    <div>
                        <span class="chore-name">${t.chore.name}</span>
                        <span class="member-name">${t.member.name}</span>
                        <state-actions
                            .conf=${{
                                normal: {
                                    icon: "add",
                                    click: async () => await this.addAssignment(t)
                                },
                                loading: {},
                                success: {},
                                error: { msToShow: 2000 }
                            }}
                            ${ref(el => (stateActions = el as StateActions))}
                            state-button-class="transparent small">
                        </state-actions>
                        <button
                            class="transparent small"
                            popovertarget="turn-popover-${t.chore.id}${t.member.id}"
                            style="anchor-name: --turn-anchor-${t.chore.id}${t.member.id}">
                            <md-icon>arrow_drop_down</md-icon>
                        </button>
                        <div class="dropdown">
                            <div
                                popover
                                id="turn-popover-${t.chore.id}${t.member.id}"
                                style="position-anchor: --turn-anchor-${t.chore.id}${t.member
                                    .id}">
                                ${this.members.map(
                                    m => html`
                                        <button
                                            class="tonal"
                                            @click=${async (e: Event) => {
                                                queryClosest(e, "[popover]")?.hidePopover();
                                                if (stateActions) {
                                                    stateActions.state = "loading";
                                                    stateActions.handleResult(
                                                        await this.addAssignment(t, m)
                                                    );
                                                }
                                                this.requestUpdate();
                                            }}>
                                            <md-icon>add</md-icon>
                                            <span class="member-name">${m.name}</span>
                                        </button>
                                    `
                                )}
                            </div>
                        </div>
                    </div>
                `;
            }
        );
}
