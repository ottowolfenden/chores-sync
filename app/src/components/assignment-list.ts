import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Context } from "../services/context";
import { ElementUtils } from "../services/element-utils.js";

@customElement("assignment-list")
export class AssignmentList extends LitElement {
    protected createRenderRoot = () => this;

    @state() private tempExampleAssignments: UiAssignment[] = [
        {
            id: 1,
            datetime: new Date(),
            quantity: 1,
            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
            chore: {
                id: 1,
                name: "Washing up",
                isDaily: true,
                limitPerDay: 1
            },
            chosenMember: {
                id: 1,
                name: "Otto",
                isActive: true,
                isAdmin: true
            }
        },
        {
            id: 2,
            datetime: new Date(),
            quantity: 1,
            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
            chore: {
                id: 2,
                name: "Cooking supper",
                isDaily: false,
                limitPerDay: null
            },
            chosenMember: {
                id: 3,
                name: "Ivo",
                isActive: true,
                isAdmin: false
            }
        },
        {
            id: 3,
            datetime: new Date(),
            quantity: 2,
            turnMember: { id: 1, name: "Otto", isActive: true, isAdmin: true },
            chore: {
                id: 8,
                name: "Emptying dishwasher",
                isDaily: false,
                limitPerDay: null
            },
            chosenMember: {
                id: 2,
                name: "Emily",
                isActive: true,
                isAdmin: true
            }
        }
    ];

    @state() private members: UiMember[] = [];

    async connectedCallback() {
        super.connectedCallback();
        this.members = (await Context.members) ?? [];
    }

    render = () =>
        repeat(
            this.tempExampleAssignments,
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
                                            <span>${m.name}</span>
                                        </button>
                                    `
                                )}
                        </div>
                    </div>
                    <button
                        class="remove tonal small"
                        @click=${(e: Event) =>
                            ElementUtils.withTransition(
                                (e.target as HTMLElement).closest<HTMLElement>(".assignment"),
                                { "height": "0", "opacity": "0", "margin-top": "0" },
                                () =>
                                    void (this.tempExampleAssignments =
                                        this.tempExampleAssignments.filter(
                                            assignment => assignment.id != a.id
                                        ))
                            )}>
                        <md-icon>remove</md-icon>
                    </button>
                </div>
            `
        );
}
