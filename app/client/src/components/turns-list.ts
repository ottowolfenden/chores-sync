import { LitElement, html } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { addAssignment } from "../functions/db-set.js";
import { Cache } from "../classes/cache";
import { queryClosest, ref } from "../functions/element-utils";
import { vibrate } from "../functions/haptics.js";
import { getDateString } from "../functions/date-utils.js";

@customElement("turns-list")
export class TurnsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) turns: UiTurn[] = [];
    @property({ type: String }) date: string = getDateString();
    @state() private members: UiMember[] = [];
    @queryAll("button") buttons!: NodeListOf<HTMLButtonElement>;

    async connectedCallback() {
        super.connectedCallback();
        this.members = (await Cache.members.get()) ?? [];
    }

    get allDisabled() {
        return [...this.buttons].every(b => b.disabled);
    }
    set allDisabled(disabled: boolean) {
        this.buttons.forEach(b => (b.disabled = disabled));
    }

    private readonly addAssignment = async (
        turn: UiTurn,
        chosenMember: UiMember = turn.member
    ): Promise<boolean> => {
        this.dispatchEvent(new Event("loading-assignment-add"));
        const assignment = {
            uuid: crypto.randomUUID(),
            date: new Date(this.date),
            quantity: 1,
            chore: turn.chore,
            turnMember: turn.member,
            chosenMember: chosenMember
        };
        const success = await addAssignment(assignment);
        vibrate(success);
        this.dispatchEvent(
            new CustomEvent(success ? "assignment-added" : "assignment-add-failed", {
                detail: { assignment }
            })
        );
        Cache.counts.refresh();
        Cache.assignmentsToday.refresh();
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
        const id = `${t.chore.id}${t.member.id}${this.date}`;
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
                    popovertarget="turn-popover-${id}"
                    style="anchor-name: --turn-anchor-${id}">
                    <md-icon>arrow_drop_down</md-icon>
                </button>
                <div class="dropdown">
                    <div
                        popover
                        id="turn-popover-${id}"
                        style="position-anchor: --turn-anchor-${id}">
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
