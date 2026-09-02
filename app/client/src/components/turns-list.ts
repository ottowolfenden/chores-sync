import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addAssignment } from "../functions/db-set.js";
import { Cache } from "../classes/cache";
import { queryClosest } from "../functions/element-utils";
import { ref } from "../functions/element-utils";
import { addHaptics } from "../functions/haptics";

@customElement("turns-list")
export class TurnsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) turns: UiTurn[] = [];
    @state() private members: UiMember[] = [];

    async connectedCallback() {
        super.connectedCallback();
        this.members = (await Cache.members.get()) ?? [];
    }

    protected update(changed: PropertyValues) {
        super.update(changed);
        addHaptics("button", this);
    }

    private readonly addAssignment = async (
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
        Cache.counts.refresh();
        Cache.todayAssignments.refresh();
        this.requestUpdate();
        return success;
    };

    private readonly handleDropdownClick = async (
        e: Event,
        turn: UiTurn,
        member: UiMember,
        stateActions: StateActions
    ) => {
        queryClosest(e, "[popover]")?.hidePopover();
        stateActions.state = "loading";
        stateActions.handleResult(await this.addAssignment(turn, member));
        this.requestUpdate();
    };

    private readonly getTurnHTML = (t: UiTurn) => {
        let stateActions: StateActions;
        return html`
            <div>
                <span class="chore-name">${t.chore.name}</span>
                <span class="member-name">${t.member.name}</span>
                <state-actions
                    .conf=${{
                        normal: {
                            icon: "add",
                            beforeTransition: () => Cache.counts.invalidate(),
                            click: async () => await this.addAssignment(t)
                        },
                        loading: {},
                        success: {},
                        error: { msToShow: 2000 }
                    }}
                    ${ref<StateActions>(el => (stateActions = el))}
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
                        style="position-anchor: --turn-anchor-${t.chore.id}${t.member.id}">
                        ${this.members.map(
                            m => html`
                                <button
                                    class="tonal"
                                    @click=${async (e: Event) =>
                                        this.handleDropdownClick(e, t, m, stateActions)}>
                                    <md-icon>add</md-icon>
                                    <span class="member-name">${m.name}</span>
                                </button>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    };

    render = () =>
        repeat(
            this.turns,
            t => t.chore.id,
            t => this.getTurnHTML(t)
        );
}
