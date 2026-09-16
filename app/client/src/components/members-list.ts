import { LitElement, html } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { queryClosest } from "../functions/element-utils";
import { Cache } from "../classes/cache";
import { updateMember } from "../functions/db-set";
import "../components/toggle-switch";

@customElement("members-list")
export class MembersList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) members: UiMember[] = [];
    @property({ type: Object }) currentMember?: UiMember;
    @queryAll(".settings") settingsEls!: NodeListOf<HTMLElement>;

    get allCollapsed() {
        return [...this.settingsEls].every(el => el.inert);
    }
    set allCollapsed(collapse: boolean) {
        this.settingsEls.forEach(el => this.toggleCollapse(el, collapse));
    }

    private toggle = async (key: "isAdmin" | "isActive", on: boolean, member: UiMember) => {
        member[key] = on;
        this.requestUpdate();
        [Cache.members, Cache.currentMember, Cache.turnsToday, Cache.assignmentsToday].forEach(
            c => c.invalidate()
        );
        const success = await updateMember(member);
        if (!success) member[key] = !on;
        this.requestUpdate();
    };

    private toggleCollapse = (el: Event | HTMLElement | null, collapse?: boolean) => {
        if (el instanceof Event)
            el = queryClosest(el, ".member")?.querySelector<HTMLElement>(".settings") ?? null;
        if (!el) return;
        collapse ??= !el.inert;
        const icon = el.parentElement?.querySelector<MdIcon>(".expand md-icon");
        el.inert = collapse;
        this.dispatchEvent(new Event("collapsetoggle"));
        icon?.setIcon(el.inert ? "keyboard_arrow_down" : "keyboard_arrow_up");
    };

    render = () =>
        repeat(
            this.members,
            m => m.id,
            m => html`
                <div class="member">
                    <div class="details" @click=${this.toggleCollapse}>
                        <div class="left-items">
                            <span class="name">${m.name}</span>
                            <span class="admin" ?hidden=${!m.isAdmin}>
                                <md-icon>shield_person</md-icon>
                                <span>Admin</span>
                            </span>
                        </div>
                        <div class="right-items">
                            <span class="active-state" ?data-active=${m.isActive}>
                                <md-icon>${m.isActive ? "check" : "close"}</md-icon>
                                <span>${m.isActive ? "Active" : "Inactive"}</span>
                            </span>
                            <button class="expand transparent">
                                <md-icon>keyboard_arrow_down</md-icon>
                            </button>
                        </div>
                    </div>

                    <div class="settings" inert>
                        <toggle-switch
                            text="Admin"
                            .on=${m.isAdmin}
                            ?disabled=${!this.currentMember?.isAdmin ||
                            m.id == this.currentMember.id}
                            @change=${(e: CustomEvent) =>
                                this.toggle("isAdmin", e.detail.on, m)}></toggle-switch>
                        <toggle-switch
                            text="Active"
                            .on=${m.isActive}
                            ?disabled=${!this.currentMember?.isAdmin}
                            @change=${(e: CustomEvent) =>
                                this.toggle("isActive", e.detail.on, m)}></toggle-switch>
                    </div>
                </div>
            `
        );
}
