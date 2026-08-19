import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

type Status = "loading" | "empty" | "error" | "success";
type Messages = Record<Status, { icon?: string; text?: string | TemplateResult }>;

@customElement("status-message")
export class StatusMessage extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, reflect: true })
    status: Status = "success";

    @property({ attribute: false })
    messages?: Messages;

    @property({ attribute: false })
    elsToHide: (Element | null)[] = [];

    private defaultMessages: Messages = {
        loading: {
            icon: "cloud_sync",
            text: "Loading, please wait."
        },
        empty: {
            icon: "mood_bad",
            text: "Nothing to show."
        },
        error: {
            icon: "error",
            text: html`Failed to fetch data.<br /><a href="">Retry</a>`
        },
        success: {}
    };

    render = () => {
        const { icon, text } = {
            ...this.defaultMessages[this.status],
            ...this.messages?.[this.status]
        };
        this.elsToHide.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));
        return html`
            <span>${icon ? html`<md-icon class="large">${icon}</md-icon>` : ""}${text}</span>
        `;
    };
}
