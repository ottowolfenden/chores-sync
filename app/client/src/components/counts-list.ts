import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property, queryAll, state } from "lit/decorators.js";
import { ref } from "../functions/element-utils";
import { repeat } from "lit/directives/repeat.js";
import type { Conf } from "./state-actions";
import { Cache } from "../classes/cache";
import { setCount } from "../functions/db-set.js";
import { addHaptics } from "../functions/haptics";

@customElement("counts-list")
export class CountsList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) counts: UiCount[] = [];
    @state() private oldCounts: UiCount[] | null = null;
    @state() private currentMember?: UiMember | null;
    @queryAll(".details") detailsULs!: NodeListOf<HTMLElement>;

    async connectedCallback() {
        super.connectedCallback();
        this.currentMember = await Cache.currentMember.get();
    }

    protected update(changed: PropertyValues) {
        super.update(changed);
        addHaptics(["button", ".count > .chore"], this);
    }

    get allCollapsed() {
        return [...this.detailsULs].every(d => d.inert);
    }
    set allCollapsed(collapse: boolean) {
        [...this.detailsULs].forEach(d =>
            this.toggleCollapse(d, d.parentElement?.querySelector("state-actions"), collapse)
        );
    }

    private readonly toggleCollapse = (
        detailsUL: HTMLElement,
        stateActions: StateActions | null | undefined,
        collapse?: boolean
    ) => {
        if (!stateActions) return;
        collapse ??= !detailsUL.inert;
        detailsUL.inert = collapse;
        const icon = detailsUL.parentElement?.querySelector(".expand md-icon");
        if (icon)
            icon.textContent = detailsUL.inert ? "keyboard_arrow_down" : "keyboard_arrow_up";
        window.dispatchEvent(
            new CustomEvent("count-collapse-toggle", {
                detail: { allCollapsed: this.allCollapsed }
            })
        );
        if (stateActions.state == "active") stateActions.cancel();
    };

    private readonly startEdit = (countDiv: HTMLElement) => {
        countDiv.toggleAttribute("data-edit-mode", true);
        this.oldCounts = structuredClone(this.counts);
    };

    private readonly invalidate = () =>
        [Cache.turns, Cache.counts, Cache.todayAssignments].forEach(c => c.invalidate());

    private readonly saveEdit = async (countDiv: HTMLElement, c: UiCount) => {
        countDiv.toggleAttribute("data-edit-mode", false);
        const success = await setCount(c);
        if (!success && this.oldCounts) this.counts = structuredClone(this.oldCounts);
        this.oldCounts = null;
        [Cache.turns, Cache.counts, Cache.todayAssignments].forEach(c => c.refresh());
        return success;
    };

    private readonly cancelEdit = async (countDiv: HTMLElement) => {
        countDiv.toggleAttribute("data-edit-mode", false);
        if (this.oldCounts) {
            this.counts = structuredClone(this.oldCounts);
            this.oldCounts = null;
        }
    };

    private readonly changeNum = (e: Event, memberCount: UiCount["memberCounts"][number]) => {
        const val = Number((e.target as HTMLInputElement).value);
        memberCount.offset += val - memberCount.total;
        memberCount.total = val;
        this.requestUpdate();
    };

    private readonly formatOffset = (offset: number) =>
        `${offset > 0 ? "+" : "−"}${Math.abs(offset)}`;

    private readonly getCountHTML = (c: UiCount) => {
        let countDiv: HTMLElement;
        let detailsUL: HTMLElement;
        let stateActions: StateActions;
        return html`
            <div class="count" ${ref(el => (countDiv = el))}>
                <div
                    class="chore"
                    @click=${() => this.toggleCollapse(detailsUL, stateActions)}>
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
                                click: () => this.startEdit(countDiv)
                            },
                            active: {
                                beforeTransition: this.invalidate,
                                click: async () => this.saveEdit(countDiv, c)
                            },
                            loading: {},
                            success: {},
                            error: {},
                            cancel: { click: async () => this.cancelEdit(countDiv) }
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
                                    @input=${(e: Event) => this.changeNum(e, mc)}
                                    @keydown=${async (e: KeyboardEvent) => {
                                        if (e.key == "Enter") await stateActions.run();
                                    }}></num-input>
                                <span class="count-text">
                                    <span class="num">${mc.total}</span>
                                    <span class="suffix"> times</span>
                                </span>
                                <span class="offset" ?hidden=${mc.offset == 0}>
                                    (<span class="num">${this.formatOffset(mc.offset)}</span
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
