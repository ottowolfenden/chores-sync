import { LitElement, html, type PropertyValues } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Context } from "../classes/context";
import { withTransition } from "../functions/element-utils.js";
import * as Haptics from "../functions/haptics.js";

@customElement("assignment-list")
export class AssignmentList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) assignments: UiAssignment[] = [];

    @property({ type: Boolean, attribute: "edit-mode" }) editMode = false;
    updated = () => this.toggleAttribute("inert", !this.editMode);

    @state() private members: UiMember[] = [];

    async connectedCallback() {
        super.connectedCallback();
        this.members = Context.members ?? [];
    }

    protected update(changed: PropertyValues) {
        super.update(changed);
        Haptics.add("button");
    }

    private removeAssignment = (e: Event, assignment: UiAssignment) =>
        withTransition(
            (e.target as HTMLElement).closest<HTMLElement>(".assignment"),
            { "height": "0", "opacity": "0", "margin-top": "0" },
            () => void (this.assignments = this.assignments.filter(a => a.id != assignment.id))
        );

    render = () =>
        repeat(
            this.assignments,
            a => a.id,
            a => html`
                <div class="assignment">
                    <span class="chore-name">${a.chore.name}</span>
                    <span class="quantity" ?hidden=${a.quantity < 2}>×${a.quantity}</span>
                    <md-icon class="swapped" ?hidden=${a.chosenMember.id == a.turnMember.id}>
                        swap_horiz
                    </md-icon>
                    <div class="name-dropdown">
                        <button
                            class="tonal"
                            popovertarget="assignment-popover-${a.id}"
                            style="anchor-name: --assignment-anchor-${a.id}">
                            <span class="member-name">${a.chosenMember.name}</span>
                            <md-icon>arrow_drop_down</md-icon>
                        </button>
                        <div
                            popover
                            id="assignment-popover-${a.id}"
                            style="position-anchor: --assignment-anchor-${a.id}">
                            ${this.members
                                .filter(m => m.id != a.chosenMember.id)
                                .map(
                                    m => html`
                                        <button
                                            class="tonal"
                                            @click=${(e: Event) => {
                                                (e.target as HTMLElement)
                                                    .closest<HTMLElement>("[popover]")
                                                    ?.hidePopover();
                                                a.chosenMember = m;
                                                this.requestUpdate();
                                            }}>
                                            <span class="member-name">${m.name}</span>
                                        </button>
                                    `
                                )}
                        </div>
                    </div>
                    <button
                        class="remove tonal small"
                        @click=${(e: Event) => this.removeAssignment(e, a)}>
                        <md-icon>remove</md-icon>
                    </button>
                </div>
            `
        );
}
