import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

export type StatusType = "loading" | "empty" | "error" | "success";
export type StatusConf = { icon?: string; text?: string };

@customElement("status-message")
export class StatusMessage extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, reflect: true })
    status: StatusType = "success";

    @property({ attribute: false })
    messages?: Partial<Record<StatusType, StatusConf>>;

    @property({ attribute: false })
    elsToHide: (HTMLElement | null)[] = [];

    render() {
        const defaultMessages = {
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
                text: "Failed to fetch data."
            },
            success: {}
        };

        const { icon, text } = {
            ...defaultMessages[this.status],
            ...this.messages?.[this.status]
        };

        this.elsToHide.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));

        return html`
            <span>${icon ? html`<md-icon class="large">${icon}</md-icon>` : ""}${text}</span>
        `;
    }
}
