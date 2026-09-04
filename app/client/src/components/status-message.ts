import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

export type Status = "loading" | "empty" | "error" | "success";
export type Message = { icon: string; spin?: boolean; text: string | TemplateResult };
export type Messages = Record<Exclude<Status, "success">, Message>;

@customElement("status-message")
export class StatusMessage extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, reflect: true }) status: Status = "success";
    @property({ attribute: false }) elsToHide: (Element | null)[] | null = null;
    @property({ attribute: false }) messages: Messages = {
        loading: {
            icon: "sync",
            spin: true,
            text: "Loading, please wait."
        },
        empty: {
            icon: "sentiment_neutral",
            text: "Nothing to show."
        },
        error: {
            icon: "error",
            text: html`Failed to fetch data.<br />
                <a href="#" @click=${() => location.reload()}>Retry</a>`
        }
    };

    protected updated = () =>
        this.elsToHide?.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));

    render = () =>
        this.status == "success"
            ? html`<span></span>`
            : html`
                  <span>
                      <md-icon class="large" ?spin=${this.messages[this.status].spin}>
                          ${this.messages[this.status].icon}
                      </md-icon>
                      ${this.messages[this.status].text}
                  </span>
              `;
}
