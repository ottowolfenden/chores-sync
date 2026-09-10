import { LitElement, html, type PropertyValues } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Cache } from "../classes/cache";
import { queryClosest, withTransition } from "../functions/element-utils.js";
import { cloneAndSum } from "../functions/assignments";

@customElement("assignments-list")
export class AssignmentsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) assignments: UiAssignment[] = [];
    @property({ type: Boolean, attribute: "edit-mode", reflect: true }) editMode = false;
    @state() private members: UiMember[] = [];

    protected willUpdate(changed: PropertyValues) {
        super.willUpdate(changed);
        this.inert = !this.editMode;
    }

    async connectedCallback() {
        super.connectedCallback();
        this.members = (await Cache.members.get()) ?? [];
    }

    addAssignment = (e: Event) =>
        (this.assignments = cloneAndSum([
            ...this.assignments,
            (e as CustomEvent).detail.assignment
        ]));

    private readonly removeAssignment = async (e: Event, assignment: UiAssignment) =>
        await withTransition(queryClosest(e, ".assignment"), {
            before: { "height": "0", "opacity": "0", "margin-top": "0" },
            after: () =>
                (this.assignments = this.assignments.filter(a => a.uuid != assignment.uuid))
        });

    private readonly changeMember = (e: Event, assignment: UiAssignment, member: UiMember) => {
        queryClosest(e, "[popover]")?.hidePopover();
        assignment.chosenMember = member;
        this.requestUpdate();
    };

    render = () =>
        repeat(
            this.assignments,
            a => a.uuid,
            a => html`
                <div class="assignment">
                    <span class="chore-name">${a.chore.name}</span>
                    <span class="quantity" ?hidden=${a.quantity < 2}>×${a.quantity}</span>
                    <md-icon class="swapped" ?hidden=${a.chosenMember.id == a.turnMember.id}>
                        swap_horiz
                    </md-icon>
                    <div class="dropdown">
                        <button
                            class="tonal"
                            popovertarget="today-assignment-popover-${a.uuid}"
                            style="anchor-name: --today-assignment-anchor-${a.uuid}">
                            <span class="member-name">${a.chosenMember.name}</span>
                            <md-icon>arrow_drop_down</md-icon>
                        </button>
                        <div
                            popover
                            id="today-assignment-popover-${a.uuid}"
                            style="position-anchor: --today-assignment-anchor-${a.uuid}">
                            ${this.members
                                .filter(m => m.id != a.chosenMember.id)
                                .map(
                                    m => html`
                                        <button
                                            class="tonal"
                                            @click=${(e: Event) => this.changeMember(e, a, m)}>
                                            <span class="member-name">${m.name}</span>
                                        </button>
                                    `
                                )}
                        </div>
                    </div>
                    <button
                        class="remove tonal small"
                        @click=${async (e: Event) => await this.removeAssignment(e, a)}>
                        <md-icon>remove</md-icon>
                    </button>
                </div>
            `
        );
}
