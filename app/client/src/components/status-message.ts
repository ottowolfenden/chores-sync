import { LitElement, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { refresh } from "../functions/routing";
import type { CacheData } from "../classes/cache";
import { vibrate } from "../functions/haptics";
import { addAnimClass } from "../functions/element-utils";

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
    @property({ type: Boolean, attribute: "hide-retry" }) hideRetry = false;
    @property({ type: Boolean, attribute: "easter-egg" }) easterEggEnabled = false;
    @property({ type: Number }) easterEggClicks = 0;
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

    private readonly easterEggIcons = [
        "sentiment_neutral",
        "sentiment_content",
        "sentiment_satisfied",
        "sentiment_excited",
        "sentiment_stressed",
        "sentiment_very_dissatisfied"
    ];

    private getContent = () => {
        if (this.status == "success") return "";
        const content = this.messages[this.status].content;
        return typeof content == "function" ? content() : content;
    };

    private handleEasterEggClick = (e: Event) => {
        vibrate(3 ** (this.easterEggClicks + 1));
        if (this.easterEggClicks == this.easterEggIcons.length - 1)
            location.hash = "#easter-egg";
        addAnimClass(e.target as HTMLElement, "shake");
        this.easterEggClicks = (this.easterEggClicks + 1) % this.easterEggIcons.length;
    };

    updated = () => {
        this.elsToHide?.forEach(el => el?.toggleAttribute("hidden", this.status != "success"));
        this.elsToDisable?.forEach(el =>
            el?.toggleAttribute("disabled", this.status != "success")
        );
    };

    render = () => {
        if (this.status == "empty" && this.easterEggEnabled)
            return html`
                <span>
                    <md-icon
                        class="large"
                        style="--shake-intensity: ${this.easterEggClicks + 1}"
                        @click=${this.handleEasterEggClick}>
                        ${this.easterEggIcons[this.easterEggClicks]}
                    </md-icon>
                    <span class="content">Nothing to show.</span>
                </span>
            `;
        return this.status == "success"
            ? html`<span></span>`
            : html`
                  <span>
                      <md-icon class="large ${this.messages[this.status].spin ? "spin" : ""}">
                          ${this.messages[this.status].icon}
                      </md-icon>
                      <span class="content">${this.getContent()}</span>
                  </span>
              `;
    };
}
