import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

type Status = "loading" | "empty" | "error" | "success";
type Message = { icon: string; text: string | TemplateResult };
type Messages = Record<Exclude<Status, "success">, Message>;

@customElement("status-message")
export class StatusMessage extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, attribute: "status", reflect: true })
    status: Status = "success";

    @property({ attribute: false })
    messages: Messages = {
        loading: {
            icon: "cloud_sync",
            text: "Loading, please wait."
        },
        empty: {
            icon: "sentiment_neutral",
            text: "Nothing to show."
        },
        error: {
            icon: "error",
            text: html`Failed to fetch data.<br /><a href="">Retry</a>`
        }
    };

    @property({ attribute: false })
    elsToHide: (Element | null)[] | null = null;

    protected updated = () =>
        this.elsToHide?.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));

    render = () =>
        this.status == "success"
            ? html`<span></span>`
            : html`
                  <span>
                      <md-icon class="large">${this.messages[this.status].icon}</md-icon>
                      ${this.messages[this.status].text}
                  </span>
              `;
}
