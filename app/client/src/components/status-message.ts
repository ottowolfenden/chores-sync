import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { refresh } from "../functions/routing";
import type { CacheData } from "../classes/cache";

export type Status = "loading" | "empty" | "error" | "success";
export type Message = {
    icon: string;
    spin?: boolean;
    content: string | TemplateResult | (() => TemplateResult);
};
export type Messages = Record<Exclude<Status, "success">, Message>;

@customElement("status-message")
export class StatusMessage extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, reflect: true }) status: Status = "success";
    @property({ type: Array }) elsToHide: (Element | null)[] = [];
    @property({ type: Array }) elsToDisable: (Element | null)[] = [];
    @property({ type: Array }) caches: CacheData[] = [];
    @property({ type: Boolean, attribute: "hide-retry" }) hideRetry: boolean = false;
    @property({ type: Object }) messages: Messages = {
        loading: { icon: "sync", spin: true, content: "Loading, please wait." },
        empty: { icon: "sentiment_neutral", content: "Nothing to show." },
        error: {
            icon: "error",
            content: () => html`
                Failed to fetch data.
                <button
                    ?hidden=${this.hideRetry}
                    @click=${() => {
                        this.caches.forEach(c => c.invalidate());
                        refresh();
                    }}>
                    <md-icon>refresh</md-icon><span>Retry</span>
                </button>
            `
        }
    };

    private getContent = () => {
        if (this.status == "success") return "";
        const content = this.messages[this.status].content;
        return typeof content == "function" ? content() : content;
    };

    updated = () => {
        this.elsToHide?.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));
        this.elsToDisable?.forEach(el =>
            el?.toggleAttribute("disabled", this.status != "success")
        );
    };

    render = () =>
        this.status == "success"
            ? html`<span></span>`
            : html`
                  <span>
                      <md-icon class="large" ?spin=${this.messages[this.status].spin}>
                          ${this.messages[this.status].icon}
                      </md-icon>
                      <span class="content">${this.getContent()}</span>
                  </span>
              `;
}
