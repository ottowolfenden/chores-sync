import { LitElement, html } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators.js";
import { ref } from "../functions/element-utils";
import { repeat } from "lit/directives/repeat.js";
import type { Conf } from "./state-actions";
import { Context } from "../classes/context";
import { setCount } from "../functions/db";

@customElement("counts-list")
export class CountsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) counts: UiCount[] = [];
    @state() private oldCounts: UiCount[] | null = null;
    @state() private currentMember?: UiMember | null;
    @queryAll(".details") detailsULs!: NodeListOf<HTMLElement>;

    async connectedCallback() {
        super.connectedCallback();
        this.currentMember = await Context.currentMember;
    }

    get allCollapsed() {
        return [...this.detailsULs].every(d => d.inert);
    }
    set allCollapsed(collapse: boolean) {
        [...this.detailsULs].forEach(d => (d.inert = collapse));
    }

    private readonly getCountHTML = (c: UiCount) => {
        let countDiv: HTMLElement;
        let detailsUL: HTMLElement;
        let stateActions: StateActions;
        return html`
            <div class="count" ${ref(el => (countDiv = el))}>
                <div
                    class="chore"
                    @click=${() => {
                        detailsUL.inert = !detailsUL.inert;
                        window.dispatchEvent(
                            new CustomEvent("count-collapse-toggle", {
                                detail: { allCollapsed: this.allCollapsed }
                            })
                        );
                        if (stateActions.state == "active") stateActions.cancel();
                    }}>
                    <span class="chore-name">${c.choreName}</span>
                    <span class="total-count" ?data-visible=${!this.currentMember?.isAdmin}>
                        <span class="num">
                            ${c.memberCounts.reduce((acc, val) => acc + val.total, 0)}
                        </span>
                        <span class="suffix"> total</span>
                    </span>
                    <state-actions
                        .conf=${{
                            normal: {
                                icon: "edit",
                                label: "Edit",
                                click: () => {
                                    countDiv.toggleAttribute("data-edit-mode", true);
                                    this.oldCounts = structuredClone(this.counts);
                                }
                            },
                            active: {
                                click: async () => {
                                    countDiv.toggleAttribute("data-edit-mode", false);
                                    const success = await setCount(c);
                                    if (!success && this.oldCounts)
                                        this.counts = structuredClone(this.oldCounts);
                                    this.oldCounts = null;
                                    return success;
                                }
                            },
                            loading: {},
                            success: {},
                            error: {},
                            cancel: {
                                click: () => {
                                    countDiv.toggleAttribute("data-edit-mode", false);
                                    if (this.oldCounts) {
                                        this.counts = structuredClone(this.oldCounts);
                                        this.oldCounts = null;
                                    }
                                }
                            }
                        } as Conf}
                        ?hidden=${!this.currentMember?.isAdmin}
                        state-button-class="tonal small"
                        cancel-button-class="outlined small"
                        ${ref<StateActions>(el => (stateActions = el))}></state-actions>
                    <button class="expand transparent">
                        <md-icon>keyboard_arrow_down</md-icon>
                    </button>
                </div>
                <ul class="details" inert ${ref(el => (detailsUL = el))}>
                    ${c.memberCounts.map(
                        mc => html`
                            <li>
                                <span class="member-name">${mc.memberName}</span>
                                <num-input
                                    name="chore-count"
                                    .value=${mc.total}
                                    @input=${(e: Event) => {
                                        const val = Number(
                                            (e.target as HTMLInputElement).value
                                        );
                                        mc.offset += val - mc.total;
                                        mc.total = val;
                                        this.requestUpdate();
                                    }}></num-input>
                                <span class="count-text">
                                    <span class="num">${mc.total}</span>
                                    <span class="suffix"> times</span>
                                </span>
                                <span class="offset" ?hidden=${mc.offset == 0}>
                                    (<span class="num"
                                        >${mc.offset > 0 ? "+" : "−"}${Math.abs(
                                            mc.offset
                                        )}</span
                                    ><span class="suffix"> offset</span>)
                                </span>
                            </li>
                        `
                    )}
                </ul>
            </div>
        `;
    };

    render = () =>
        repeat(
            this.counts,
            c => c.choreName,
            c => this.getCountHTML(c)
        );
}
