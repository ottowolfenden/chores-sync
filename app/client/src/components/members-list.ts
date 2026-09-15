import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { queryClosest, withTransition } from "../functions/element-utils";
import "../components/toggle-switch";

@customElement("members-list")
export class MembersList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) members: UiMember[] = [];
    @property({ type: Object }) currentMember?: UiMember;

    private toggleAdmin = async (on: boolean, member: UiMember) => {
        member.isAdmin = on;
        this.requestUpdate();
    };

    private toggleActive = async (on: boolean, member: UiMember) => {
        member.isActive = on;
        this.requestUpdate();
    };

    private toggleCollapse = (e: Event, collapse?: boolean) => {
        const settingsEl = queryClosest(e, ".member")?.querySelector<HTMLElement>(".settings");
        if (!settingsEl) return;
        collapse ??= !settingsEl.inert;
        const icon = settingsEl.parentElement?.querySelector<MdIcon>(".expand md-icon");
        icon?.setIcon(collapse ? "keyboard_arrow_down" : "keyboard_arrow_up");
        if (collapse)
            withTransition(settingsEl, {
                before: () => settingsEl.classList.add("collapsing"),
                after: () => {
                    settingsEl.inert = true;
                    settingsEl.classList.remove("collapsing");
                }
            });
        else settingsEl.inert = false;
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
                                this.toggleAdmin(e.detail.on, m)}></toggle-switch>
                        <toggle-switch
                            text="Active"
                            .on=${m.isActive}
                            ?disabled=${!this.currentMember?.isAdmin}
                            @change=${(e: CustomEvent) =>
                                this.toggleActive(e.detail.on, m)}></toggle-switch>
                    </div>
                </div>
            `
        );
}
