import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "../components/toggle-switch";

@customElement("members-list")
export class MembersList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) members: UiMember[] = [];
    @property({ type: Object }) currentMember?: UiMember;

    render = () =>
        repeat(
            this.members,
            m => m.id,
            m => html`
                <div class="member">
                    <span class="name">${m.name}</span>
                    <toggle-switch
                        text="Admin"
                        .on=${m.isAdmin}
                        ?disabled=${!this.currentMember?.isAdmin}></toggle-switch>
                    <toggle-switch
                        text="Active"
                        .on=${m.isActive}
                        ?disabled=${!this.currentMember?.isAdmin}></toggle-switch>
                </div>
            `
        );
}
