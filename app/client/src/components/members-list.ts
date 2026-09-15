import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "../components/toggle-switch";

@customElement("members-list")
export class MembersList extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Array }) members: UiMember[] = [];
    @property({ type: Object }) currentMember?: UiMember;

    private toggleAdmin = (on: boolean) => {
        console.log(on);
    };

    private toggleActive = (on: boolean) => {
        console.log(on);
    };

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
                        ?disabled=${!this.currentMember?.isAdmin}
                        @change=${(e: CustomEvent) =>
                            this.toggleAdmin(e.detail.on)}></toggle-switch>
                    <toggle-switch
                        text="Active"
                        .on=${m.isActive}
                        ?disabled=${!this.currentMember?.isAdmin}
                        @change=${(e: CustomEvent) =>
                            this.toggleActive(e.detail.on)}></toggle-switch>
                </div>
            `
        );
}
